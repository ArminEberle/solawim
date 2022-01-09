<?php declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once("../../../../wp-load.php");

global $wpdb;
$membershipTable = "{$wpdb->prefix}_solawim_memberships";

// class SepaDetails {
//     public $accountHolder;
//     public $iban;
//     public $bic;
// }

function ensureDBInitialized() {
    global $wpdb;
    global $membershipTable;
    $cnt = $wpdb->get_results("SELECT count(*) as cnt from information_schema.tables WHERE table_name = '{$membershipTable}'", ARRAY_A);
    if($cnt[0]['cnt'] > 0) {
        return;
    }
    $wpdb->get_results("CREATE TABLE `{$membershipTable}` (user_id INT PRIMARY KEY, content JSON );", ARRAY_A);
    return;
}

function getUserId() {
    global $current_user;
    $current_user = wp_get_current_user();
    return $current_user->get('ID');
}

function getMembershipData(string $accountId) {
    ensureDBInitialized();
    global $wpdb;
    global $membershipTable;
    $results = $wpdb->get_results(
        $wpdb->prepare( "SELECT * FROM {$membershipTable} WHERE user_id = %d", $accountId),
        ARRAY_A
    );
    if(count($results) === 0) {
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
        $results = $results[0];
    }
    return $results;
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

$app = new \Slim\App;

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
    if(!($userId > 0)) {
      $response = $response->withStatus(401);
      $response->getBody()->write('{"status": "FAIL", "message": "Please login before proceeding"}');
      return $response;
    }
    $result = getMembershipData($userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membership', function (Request $request, Response $response, array $args) {
    global $current_user;
    $current_user = wp_get_current_user();
    $userId = $current_user->get('ID');
    $result = getMembershipData($userId);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->run();
