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

$solatables = [$membershipTable, $personTable];

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

function getUserId()
{
    global $current_user;
    $current_user = wp_get_current_user();
    return $current_user->get('ID');
}

function getUserData(string $tablename, object $defaultContent)
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

function getMembershipData(string $accountId)
{
    ensureDBInitialized();
    global $wpdb;
    global $membershipTable;
    $results = $wpdb->get_results(
        $wpdb->prepare("SELECT content FROM {$membershipTable} WHERE user_id = %d", $accountId),
        ARRAY_A
    );
    if (count($results) === 0) {
        $results = [
            'lastModified'=> null,
            'applied' => false,
            'signed' => false,
            'orders' => [
              'bread' => [
                  'count' => 0,
                  'factor' => 1,
              ],
              'meat' => [
                  'count' => 0,
                  'factor' => 1,
              ],
            ],
            'pos'=>null,
        ];
    } else {
        $results = json_decode($results[0]['content'], false);
    }
    return $results;
}

function setMembershipData(string $accountId, $membershipData)
{
    ensureDBInitialized();
    global $wpdb;
    global $membershipTable;
    $content = json_encode($membershipData);
    $results = $wpdb->get_results(
        $wpdb->prepare("
        INSERT INTO {$membershipTable} (user_id, content)
        VALUES(%s, %s)
        ON DUPLICATE KEY UPDATE content = %s
        ", $accountId, $content, $content),
        ARRAY_A
    );
    return getMembershipData($accountId);
}

function validateMembershipSubmission($submission)
{
    $validator = new Validator();
    $validator->validate($submission, (object)['$ref' => 'file://' . __DIR__ . '/membership-schema.json'], Constraint::CHECK_MODE_COERCE_TYPES);
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
            'address' => 'Oberrieden',
        ],
        'freudenthal' => [
            'name' => 'Freudenthal',

            'address' => 'Am Mittelberg 6a, Witzenhausen',
        ]
    ),
    'products' => [
      'meat' => [
        'price' => 100,
        'target' => 100,
      ],
      'bread' => [
        'price' => 100,
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
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $content = json_decode($request->getBody()->getContents(), false);

    $validateResult = validateMembershipSubmission($content);

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

    $result = setMembershipData($userId, $content);

    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->run();
