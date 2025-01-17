<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use JsonSchema\Validator as Validator;
use JsonSchema\Constraints\Constraint;

require_once(__DIR__ . '/../../../../wp-load.php');

global $wpdb;
$dbInitialized = false;

add_role('vereinsverwaltung', 'Vereinsverwaltung');

$seasons = [2024, 2025];
$defaultSeason = 2025;

$seasonToMembership = array(
    2024 => array(
        "membership" => "{$wpdb->prefix}solawim_2024",
        "hist" =>  "{$wpdb->prefix}solawim_2024_hist"
    ),
    2025 => array(
        "membership" => "{$wpdb->prefix}solawim_2025",
        "hist" =>  "{$wpdb->prefix}solawim_2025_hist"
    ),
);

function ensureDBInitialized()
{
    global $wpdb;
    global $dbInitialized;
    global $seasons;

    if ($dbInitialized) {
        return;
    }
    foreach ($seasons as $season) {
        $tablename = "{$wpdb->prefix}solawim_{$season}";
        $wpdb->get_results("CREATE TABLE IF NOT EXISTS `{$tablename}` (user_id INT PRIMARY KEY, content JSON, createdAt DATETIME, createdBy varchar(255));", ARRAY_A);
        $wpdb->get_results("CREATE TABLE IF NOT EXISTS `{$tablename}_hist` (user_id INT, content JSON, createdAt DATETIME, createdBy varchar(255));", ARRAY_A);
    }
    $dbInitialized = true;
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

function getUserData(
    string $tablename,
    object $defaultContent,
    string $accountId,
) {
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

function getBankingData()
{
    ensureDBInitialized();
    global $wpdb;
    global $seasonToMembership;
    global $defaultSeason;
    $membershipTable = $seasonToMembership[$defaultSeason]["membership"];
    $results = $wpdb->get_results(
        $wpdb->prepare("SELECT content FROM {$membershipTable} WHERE user_id = %d", 0),
        ARRAY_A
    );
    if (count($results) === 0) {
        $results = null;
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

function updateMailingLists()
{
    try {
        if (!class_exists(\MailPoet\API\API::class)) {
            return;
        }
        $mailpoet_api = \MailPoet\API\API::MP('v1');
        global $defaultSeason;
        $allUsers = getAllMemberData($defaultSeason);

        $allUsersList = [];
        $fleischUsersList = [];
        $milchUsersList = [];
        $brotUsersList = [];
        $veggieUsersList = [];
        $hutzelberghofUsersList = [];
        $witzenhausenUsersList = [];
        $gertenbachUsersList = [];

        foreach ($allUsers as $user) {
            if (!$user["membership"]->member) {
                continue;
            }
            // error_log(print_r($user, true));
            array_push($allUsersList, $user);
            if ($user["membership"]->fleischMenge > 0) {
                array_push($fleischUsersList, $user);
            }
            if ($user["membership"]->milchMenge > 0) {
                array_push($milchUsersList, $user);
            }
            if ($user["membership"]->veggieMenge > 0) {
                array_push($veggieUsersList, $user);
            }
            if ($user["membership"]->brotMenge > 0) {
                array_push($brotUsersList, $user);
            }
            if ($user["membership"] -> abholraum === 'hutzelberghof') {
                array_push($hutzelberghofUsersList, $user);
            }
            if ($user["membership"] -> abholraum === 'witzenhausen') {
                array_push($witzenhausenUsersList, $user);
            }
            if ($user["membership"] -> abholraum === 'gertenbach') {
                array_push($gertenbachUsersList, $user);
            }
        }

        $lists = $mailpoet_api->getLists();
        $allSubscribers = $mailpoet_api->getSubscribers(array(), 10000, 0);

        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_ALLE', $allUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_FLEISCH', $fleischUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_MILCH', $milchUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_VEGGIE', $veggieUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_BROT', $brotUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_HUTZELBERGHOF', $hutzelberghofUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_WITZENHAUSEN', $witzenhausenUsersList, $allSubscribers);
        ensureMailingList($mailpoet_api, $lists, 'AUTO_LISTE_GERTENBACH', $gertenbachUsersList, $allSubscribers);

        // error_log(print_r($allUsers, true));
        // error_log(print_r($allUsersList, true));
    } catch (Exception $e) {
        error_log('Problem when updating the mailing lists: '.$e);
    }
}

function ensureMailingList($api, $allLists, $listName, $members, $allSubscribers)
{
    $theList = null;
    foreach ($allLists as $list) {
        if ($list["name"] === $listName) {
            $theList = $list;
            break;
        }
    }
    if ($theList === null) {
        $theList = $api->addList(array(
            "name" => $listName,
            "description" => "Automatisch erzeugte Liste aus den Mitgliedschaften"
        ));
    }
    ensureMembersInMailingList($api, $theList, $members, $allSubscribers);
}

function ensureMembersInMailingList($api, $mailList, $members, $allSubscribers)
{
    $currentSubscribers = $api->getSubscribers(array("listId" => $mailList["id"]), 10000, 0);
    // delete obsolete members
    foreach ($currentSubscribers as $subscriber) {
        $deleteIt = true;

        foreach ($members as $member) {
            if ($member["id"] === $subscriber["wp_user_id"]) {
                $deleteIt = false;
                break;
            }
        }
        if ($deleteIt === true) {
            $api->unsubscribeFromList($subscriber["id"], $mailList["id"]);
        }
    }
    // add missing members
    foreach ($members as $member) {
        $addIt = true;
        foreach ($currentSubscribers as $subscriber) {
            if ($member["id"] === $subscriber["wp_user_id"]) {
                $addIt = false;
                break;
            }
        }
        if ($addIt === true) {
            // try find if the person is already a subscriber and create it if necessary
            $registeredSubscriber = null;
            foreach ($allSubscribers as $currentSubscriber) {
                if ($member["user_email"] === $currentSubscriber["email"]) {
                    $registeredSubscriber = $currentSubscriber;
                    break;
                }
            }
            if ($registeredSubscriber === null) {
                // subscriber not found, need to create it
                error_log(print_r($member, true));
                $registeredSubscriber = $api -> addSubscriber(array(
                    "email" => $member["user_email"],
                    "first_name" => $member["membership"]->firstname,
                    "last_name" => $member["membership"]->lastname,
                ), array(), array(
                    "skip_subscriber_notification" => false
                ));
            }
            try {
                $api->subscribeToList($registeredSubscriber["id"], $mailList["id"]);
            } catch (Exception $e) {
                error_log('Problem when adding '.$member["user_nicename"].' to '.$mailList["name"].': '.$e);
            }
        }
    }
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

function getAllMemberData($season)
{
    global $seasonToMembership;
    ensureDBInitialized();
    $membershipTable = $seasonToMembership[$season]["membership"];
    $membershipTableHist = $seasonToMembership[$season]["hist"];
    global $wpdb;
    $query = "
    SELECT  u.id,
            u.user_nicename,
            u.user_email,
            m.content as membership,
            mandateDate.mandateDate
    FROM    {$wpdb->prefix}users u
            LEFT JOIN {$membershipTable} m on u.ID = m.user_id
            LEFT JOIN (
                SELECT 	c.user_id as user_id,
                        coalesce(min(h.createdAt), c.createdAt) as mandateDate
                FROM 	{$membershipTable} c
                        LEFT JOIN {$membershipTableHist} h ON 
                            c.user_id = h.user_id
                            AND json_extract(c.content, '$.bic') = json_extract(h.content, '$.bic')
                            AND json_extract(c.content, '$.iban') = json_extract(h.content, '$.iban')
                            AND json_extract(c.content, '$.accountowner') = json_extract(h.content, '$.accountowner')
                GROUP BY c.user_id
            ) mandateDate ON u.ID = mandateDate.user_id
    ORDER BY u.user_nicename
    ";
    // error_log("Season ".$season);
    // error_log($query);
    $results = $wpdb->get_results(
        $wpdb->prepare($query),
        ARRAY_A
    );
    foreach ($results as &$row) {
        if (!is_null($row["membership"])) {
            $row["membership"] = json_decode($row["membership"]);
            // $row["membership"]->mandateDate = date("c", strtotime($row["mandateDate"]));
            $row["membership"]->mandateDate = (new DateTime($row["mandateDate"]))->format('Y-m-d');
            unset($row["mandateDate"]);
        }
    }
    return $results;
}

function getAllMemberDataHistory($season)
{
    global $seasonToMembership;
    ensureDBInitialized();
    $membershipTable = $seasonToMembership[$season]["membership"];
    $membershipTableHist = $seasonToMembership[$season]["hist"];
    global $wpdb;
    $results = $wpdb->get_results(
        $wpdb->prepare("
    SELECT  u.id,
            u.user_nicename,
            u.user_email,
            x.*,
            c.user_nicename AS createdBy
    FROM {$wpdb->prefix}users u
    LEFT JOIN (
        SELECT * FROM `{$membershipTable}`
        UNION
        SELECT * FROM `{$membershipTableHist}`
    ) x ON u.id = x.user_id
    LEFT JOIN {$wpdb->prefix}users c ON x.createdBy = c.id
    ORDER BY x.createdAt DESC
    "),
        ARRAY_A
    );
    foreach ($results as &$row) {
        if (!is_null($row["content"])) {
            $row["membership"] = json_decode($row["content"]);
            $row["membership"] = json_decode($row["content"]);
            unset($row["content"]);
        }
    }
    return $results;
}

function getMembershipData(string $accountId, $season)
{
    global $seasonToMembership;
    $membershipTable = $seasonToMembership[$season]["membership"];
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

function getSeasonFromQueryString(Request $request)
{
    global $defaultSeason;
    $query = $request->getQueryParams();
    if (isset($query["season"])) {
        return $query["season"];
    }
    return $defaultSeason;
}

$app = new \Slim\App();

$app->get('/membership', function (Request $request, Response $response, array $args) {
    $season = getSeasonFromQueryString($request);
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $result = getMembershipData($userId, $season);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membership', function (Request $request, Response $response, array $args) {
    global $seasonToMembership;
    $season = getSeasonFromQueryString($request);
    $membershipTable = $seasonToMembership[$season]["membership"];
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
    $previousVersion = getMembershipData($userId, $season);
    if (!is_null($previousVersion)) {
        $previousActiveMembership = $previousVersion->active;
        if (is_null($previousActiveMembership)) {
            $previousActiveMembership = false;
        }
        $content->active = $previousActiveMembership;
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
    global $seasonToMembership;
    $season = getSeasonFromQueryString($request);
    $membershipTable = $seasonToMembership[$season]["membership"];

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
    $season = getSeasonFromQueryString($request);
    $membershipTable = $seasonToMembership[$season]["membership"];

    $userId = getUserId();
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $contentString = $request->getBody()->getContents();
    $content = json_decode($contentString, false);
    $targetUserId = $content->targetUserId;
    $activeMembership = $content->active;

    $membershipData = getMembershipData($targetUserId, $season);
    if (!is_null($membershipData)) {
        $membershipData->active = $activeMembership;
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
    global $seasonToMembership;
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $season = getSeasonFromQueryString($request);
    $membershipTable = $seasonToMembership[$season]["membership"];

    $response->getBody()->write(json_encode(getAllMemberData($season)));
    return $response->withStatus(200);
});

$app->get('/updatemailinglists', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    updateMailingLists();
    $response->getBody()->write('{}');
    return $response->withStatus(200);
});

$app->get('/membershistory', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $season = getSeasonFromQueryString($request);
    $response->getBody()->write(json_encode(getAllMemberDataHistory($season)));
    return $response->withStatus(200);
});

$app->get('/bankingdata', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $response->getBody()->write(json_encode(getBankingData()));
    return $response->withStatus(200);
});

$app->get('/seasons', function (Request $request, Response $response, array $args) {
    global $seasons;
    $response->getBody()->write(json_encode($seasons));
    return $response->withStatus(200);
});

$app->run();
