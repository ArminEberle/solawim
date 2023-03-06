<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use JsonSchema\Validator as Validator;
use JsonSchema\Constraints\Constraint;

require_once(__DIR__ . '/../../../../wp-load.php');

global $wpdb;

add_role('vereinsverwaltung', 'Vereinsverwaltung');

$membershipTable = "{$wpdb->prefix}solawim_2023";

$solatables = [$membershipTable];

function ensureDBInitialized()
{
    global $wpdb;
    global $solatables;
    foreach ($solatables as $tablename) {
        $cnt = $wpdb->get_results("SELECT count(*) as cnt from information_schema.tables WHERE table_name = '{$tablename}'", ARRAY_A);
        if ($cnt[0]['cnt'] > 0) {
            return;
        }
        $wpdb->get_results("CREATE TABLE `{$tablename}` (user_id INT PRIMARY KEY, content JSON, createdAt DATETIME, createdBy varchar(255));", ARRAY_A);
    }
    foreach ($solatables as $tablename) {
        $cnt = $wpdb->get_results("SELECT count(*) as cnt from information_schema.tables WHERE table_name = '{$tablename}_hist'", ARRAY_A);
        if ($cnt[0]['cnt'] > 0) {
            return;
        }
        $wpdb->get_results("CREATE TABLE `{$tablename}_hist` (user_id INT, content JSON, createdAt DATETIME, createdBy varchar(255));", ARRAY_A);
    }
    return;
}

function reportError(string $message, Response $response, $status = 404)
{
    $response = $response->withStatus(401);
    $response->getBody()->write("{\"status\": \"FAIL\", \"message\": \"$message\"}");
    return $response;
}

function checkBool($object, $propName)
{
    return $object[$propName] === true || $object[$propName] === false;
}

function checkNotEmpty($strVal)
{
    return !empty($strVal) && strlen(trim($strVal)) > 0;
}

function getUserId()
{
    global $current_user;
    $current_user = wp_get_current_user();
    return $current_user->get('ID');
}

function getUserData(string $tablename, object $defaultContent, string $accountId)
{
    ensureDBInitialized();
    global $wpdb;
    $results = $wpdb->get_results(
        $wpdb->prepare("SELECT content FROM {$tablename} WHERE user_id = %d", $accountId),
        ARRAY_A
    );
    if (count($results) === 0) {
        $results = $defaultContent;
    } else {
        $results = json_decode($results[0]['content'], false);
    }
    return $results;
}

// $accountId is the requestor, $userId is the user for which we are storing the data
function setUserData(string $tablename, object $content, string $accountId, string $userId)
{
    ensureDBInitialized();
    global $wpdb;
    $content = json_encode($content);

    // first store history
    $wpdb->get_results(
        $wpdb->prepare(
            "
        INSERT INTO   {$tablename}_hist
        SELECT *
        FROM   {$tablename}
        WHERE  user_id = %d
        ",
            $userId,
        ),
        ARRAY_A
    );

    // then the new
    $results = $wpdb->get_results(
        $wpdb->prepare(
            "
        INSERT INTO {$tablename} (user_id, content, createdBy, createdAt)
        VALUES(%d, %s, %d, NOW())
        ON DUPLICATE KEY UPDATE content = %s, createdAt = NOW()
        ",
            $userId,
            $content,
            $accountId,
            $content
        ),
        ARRAY_A
    );
    return getUserData($tablename, (object) null, $userId);
}

function clearUserData(string $tablename, string $accountId)
{
    ensureDBInitialized();
    global $wpdb;
    $results = $wpdb->get_results(
        $wpdb->prepare("DELETE FROM {$tablename} WHERE user_id = %d", $accountId),
        ARRAY_A
    );
    return getUserData($tablename, (object) null, $accountId);
}

function getAllMemberData()
{
    ensureDBInitialized();
    global $membershipTable;
    global $wpdb;
    $results = $wpdb->get_results(
        $wpdb->prepare("
        SELECT  u.id,
                u.user_nicename,
                u.user_email,
                m.content as membership
        FROM    {$wpdb->prefix}users u
                LEFT JOIN {$membershipTable} m on u.ID = m.user_id
        ORDER BY u.user_nicename
        "),
        ARRAY_A
    );
    foreach ($results as &$row) {
        if (!is_null($row["membership"])) {
            $row["membership"] = json_decode($row["membership"]);
        }
    }
    return $results;
}

function getMembershipData(string $accountId)
{
    global $membershipTable;
    return getUserData($membershipTable, (object) [], $accountId);
}

function validateJson($submission, $schemaName)
{
    $validator = new Validator();
    $validator->validate($submission, (object)['$ref' => 'file://' . __DIR__ . '/' . $schemaName], Constraint::CHECK_MODE_COERCE_TYPES);
    if ($validator->isValid()) {
        return null;
    }
    $errorMsg = 'The submitted JSON document is not valid:\nThe document:\n' . json_encode($submission, JSON_PRETTY_PRINT) . '\n';
    foreach ($validator->getErrors() as $error) {
        $errorMsg .= "{$error['property']}: {$error['message']}\n";
    }
    return $errorMsg;
}

$app = new \Slim\App();

$app->get('/membership', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $result = getMembershipData($userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membership', function (Request $request, Response $response, array $args) {
    global $membershipTable;
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $contentString = $request->getBody()->getContents();
    if (strlen(trim($contentString)) === 0) {
        $result = clearUserData($membershipTable, $userId);
        $response->getBody()->write(json_encode($result));
        return $response;
    }

    $content = json_decode($contentString, false);

    // we cannot change this activeMembership state with this service
    // thus we set the previous or false as the value up front
    $previousVersion = getMembershipData($userId);
    if (!is_null($previousVersion)) {
        $previousActiveMembership = $previousVersion->activeMembership;
        if (is_null($previousActiveMembership)) {
            $previousActiveMembership = false;
        }
        $content->activeMembership = $previousActiveMembership;
    }

    $validateResult = validateJson($content, 'member-data-schema.json');

    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }

    $result = setUserData($membershipTable, $content, $userId, $userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membership-admin', function (Request $request, Response $response, array $args) {
    global $membershipTable;
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $contentString = $request->getBody()->getContents();

    $content = json_decode($contentString, false);

    $validateResult = validateJson($content, 'member-data-admin-schema.json');

    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }

    $userId = $content->targetUserId;
    $userContent = $content->memberData;

    $result = setUserData($membershipTable, $userContent, $accountId, $userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membershipactive', function (Request $request, Response $response, array $args) {
    global $membershipTable;
    $userId = getUserId();
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $contentString = $request->getBody()->getContents();
    $content = json_decode($contentString, false);
    $targetUserId = $content->targetUserId;
    $activeMembership = $content->activeMembership;

    $membershipData = getMembershipData($targetUserId);
    if (!is_null($membershipData)) {
        $membershipData->activeMembership = $activeMembership;
        $result = setUserData($membershipTable, $membershipData, $userId, $targetUserId);
    }

    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->get('/loggedin', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    return $response->withStatus(200);
});

function checkUserIsVereinsverwaltung(Request $request, Response $response)
{
    global $wp_roles;
    $current_user = wp_get_current_user();
    if (!in_array('vereinsverwaltung', $current_user->roles)) {
        return reportError('Dir fehlt eine Rolle um hier fortzufahren', $response, 401);
    }
    return null;
}

$app->get('/members', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $response->getBody()->write(json_encode(getAllMemberData()));
    return $response->withStatus(200);
});

$app->run();
