<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use JsonSchema\Validator as Validator;
use JsonSchema\Constraints\Constraint;

require_once(__DIR__ . '/../../../../wp-load.php');

global $wpdb;

$membershipTable = "{$wpdb->prefix}solawim_membership";
$personTable = "{$wpdb->prefix}solawim_person";
$sepaTable = "{$wpdb->prefix}solawim_sepa";

$solatables = [$membershipTable, $personTable, $sepaTable];

function ensureDBInitialized()
{
    global $wpdb;
    global $solatables;
    foreach ($solatables as $tablename) {
        $cnt = $wpdb->get_results("SELECT count(*) as cnt from information_schema.tables WHERE table_name = '{$tablename}'", ARRAY_A);
        if ($cnt[0]['cnt'] > 0) {
            return;
        }
        $wpdb->get_results("CREATE TABLE `{$tablename}` (user_id INT PRIMARY KEY, content JSON );", ARRAY_A);
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

function setUserData(string $tablename, object $content, string $accountId)
{
    ensureDBInitialized();
    global $wpdb;
    $content = json_encode($content);
    $results = $wpdb->get_results(
        $wpdb->prepare("
        INSERT INTO {$tablename} (user_id, content)
        VALUES(%s, %s)
        ON DUPLICATE KEY UPDATE content = %s
        ", $accountId, $content, $content),
        ARRAY_A
    );
    return getUserData($tablename, (object) null, $accountId);
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

function getMembershipData(string $accountId)
{
    global $membershipTable;
    return getUserData($membershipTable, (object)[
            'lastModified'=> null,
            'applied' => false,
            'signed' => false,
            'orders' => (object)[
              'bread' => (object)[
                  'count' => 0,
                  'factor' => 0,
              ],
              'meat' =>  (object)[
                  'count' => 0,
                  'factor' => 0,
              ],
            ],
            'pos'=>null,
          ], $accountId);
}

function getPersonData(string $accountId)
{
    global $personTable;
    return getUserData($personTable, (object)[
            'firstname' => null,
            'lastname' => null,
            'street' => null,
            'zip' => null,
            'city' => null,
            'phone' => null,
          ], $accountId);
}

function getSepaData(string $accountId)
{
    global $sepaTable;
    return getUserData($sepaTable, (object)[
          'iban' => null,
          'bank' => null,
          'bic' => null,
          'name' => null,
          'street' => null,
          'zip' => null,
          'city' => null,
        ], $accountId);
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

$staticData = [
    'pos' => array(
        'hutzelberghof' => [
            'name' => 'Hutzelberghof',
            'address' => 'Hilgershäuser Str. 20, Oberrieden, Bad Sooden-Allendorf',
        ],
        'witzenhausen' => [
            'name' => 'Witzenhausen',
            'address' => 'Nordbahnhofstraße, beim Falafelladen, Witzenhausen',
        ],
    ),
    'products' => [
      'meat' => [
        'price' => 90,
        'target' => 80,
      ],
      'bread' => [
        'price' => 25,
        'target' => 100,
      ]
      ]
  ];

$app = new \Slim\App();

$app->get('/statics', function (Request $request, Response $response, array $args) {
    global $staticData;
    global $current_user;
    $result = [
        'userName' => $current_user->get('user_nicename'),
        'app' => $staticData,
      ];
    $response->getBody()->write(json_encode($result));
    return $response;
});

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

    $validateResult = validateJson($content, 'membership-schema.json');

    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }

    foreach ($content->orders as $name => $order) {
        if ($order->count < 0) {
            return reportError("The count of $name must be at least 0", $response, 404);
        }
        if ($order->count > 10) {
            return reportError("The count of $name must be 10 or less", $response, 404);
        }
        if (!in_array($order->factor, [-1, 0, 1], true)) {
            return reportError("The factor of $name must -1, 0 or 1", $response, 404);
        }
    }

    $result = setUserData($membershipTable, $content, $userId);

    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->get('/personal', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $result = getPersonData($userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/personal', function (Request $request, Response $response, array $args) {
    global $personTable;
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $contentString = $request->getBody()->getContents();
    if (strlen(trim($contentString)) === 0) {
        $result = clearUserData($personTable, $userId);
        $response->getBody()->write(json_encode($result));
        return $response;
    }
    $content = json_decode($contentString, false);

    $validateResult = validateJson($content, 'personal-schema.json');
    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }
    if (!checkNotEmpty($content->city)) {
        return reportError("Attribute city may not be empty", $response);
    }
    if (!checkNotEmpty($content->phone)) {
        return reportError("Attribute phone may not be empty", $response);
    }
    if (!checkNotEmpty($content->street)) {
        return reportError("Attribute street may not be empty", $response);
    }
    if (!checkNotEmpty($content->lastname)) {
        return reportError("Attribute lastname may not be empty", $response);
    }
    if (!checkNotEmpty($content->firstname)) {
        return reportError("Attribute firstname may not be empty", $response);
    }
    if ($content->zip < 10000 || $content->zip > 99999) {
        return reportError("Attribute zip must be between 10000 and 99999", $response);
    }

    $result = setUserData($personTable, $content, $userId);

    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->get('/sepa', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $result = getSepaData($userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/sepa', function (Request $request, Response $response, array $args) {
    global $sepaTable;
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $contentString = $request->getBody()->getContents();
    if (strlen(trim($contentString)) === 0) {
        $result = clearUserData($sepaTable, $userId);
        $response->getBody()->write(json_encode($result));
        return $response;
    }
    $content = json_decode($contentString, false);

    $validateResult = validateJson($content, 'sepa-schema.json');
    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }
    if (!checkNotEmpty($content->iban)) {
        return reportError("Attribute iban may not be empty", $response);
    }
    if (!checkNotEmpty($content->bank)) {
        return reportError("Attribute bank may not be empty", $response);
    }
    if (!checkNotEmpty($content->bic)) {
        return reportError("Attribute bic may not be empty", $response);
    }
    if (!checkNotEmpty($content->city)) {
        return reportError("Attribute city may not be empty", $response);
    }
    if (!checkNotEmpty($content->street)) {
        return reportError("Attribute street may not be empty", $response);
    }
    if (!checkNotEmpty($content->name)) {
        return reportError("Attribute name may not be empty", $response);
    }
    if ($content->zip < 10000 || $content->zip > 99999) {
        return reportError("Attribute zip must be between 10000 and 99999", $response);
    }

    $result = setUserData($sepaTable, $content, $userId);

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

$app->run();
