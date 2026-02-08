<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use JsonSchema\Validator as Validator;
use JsonSchema\Constraints\Constraint;


require_once(__DIR__ . '/../../../../wp-load.php');
// Enable exception throwing for SQL errors so they are caught by Slim error handler
if (isset($wpdb) && method_exists($wpdb, 'throw_errors')) {
    $wpdb->throw_errors(true);
}

global $wpdb;
    $dbInitialized = false;

$dbInitialized = false;

add_role('vereinsverwaltung', 'Vereinsverwaltung');

$seasons = [2025, 2026];
$defaultSeason = 2026;

$seasonToMembership = array(
    2025 => array(
        "membership" => "{$wpdb->prefix}solawim_2025",
        "hist" =>  "{$wpdb->prefix}solawim_2025_hist"
    ),
    2026 => array(
        "membership" => "{$wpdb->prefix}solawim_2026",
        "hist" =>  "{$wpdb->prefix}solawim_2026_hist"
    ),
);

$senderAddress = 'info@hoehberg-kollektiv.de';
$testEmailPrefix = '[SOLAWI-ORGA-TEST] ';
$forRealEmailPrefix = '[SOLAWI-ORGA] ';

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
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $wpdb->get_results("CREATE TABLE IF NOT EXISTS `{$emailsTable}` (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        createdBy BIGINT UNSIGNED,
        is_test BOOLEAN DEFAULT FALSE,
        subject TEXT,
        body TEXT,
        content JSON,
        createdAt DATETIME,
        status ENUM('stored', 'processing', 'success', 'failed', 'partially_failed') DEFAULT 'stored',
        failure_reason TEXT,
        season INT,
        INDEX idx_solawim_emails_createdBy (createdBy)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4", ARRAY_A);

    // Create email_send_status table
    $sendStatusTable = "{$wpdb->prefix}solawim_email_send_status";
    $wpdb->get_results(
        "CREATE TABLE IF NOT EXISTS `{$sendStatusTable}` (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email_id BIGINT UNSIGNED NOT NULL,
            recipient_email VARCHAR(255) NOT NULL,
            status ENUM('stored', 'success', 'failed') DEFAULT 'stored',
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (email_id) REFERENCES {$emailsTable}(id) ON DELETE CASCADE,
            INDEX idx_email_id (email_id),
            INDEX idx_recipient_email (recipient_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        ARRAY_A
    );

    $dbInitialized = true;
    return;
}

function send_email_with_wpmail( $to, $subject, $message ) {
    $headers = array( 'Content-Type: text/plain; charset=UTF-8' );
    
    add_filter( 'wp_mail_content_type', function() { return 'text/plain'; } );
    
    $result = wp_mail( $to, $subject, $message, $headers );
    
    // Clean up filter
    remove_all_filters( 'wp_mail_content_type' );
    
    if ( $result ) {
        error_log( "Email sent successfully to: $to" );
        return true;
    } else {
        error_log( "wp_mail failed for: $to" );
        // Optional: Hook into wp_mail_failed for more details
        return false;
    }
}

/**
 * Sends emails for all recipients in 'stored' status for a given email ID using send_email_with_wpmail.
 * Updates the status to 'success' or 'failed' accordingly.
 */
function solawim_handle_email_sending_with_wpmail(int $emailId): void
{
    ensureDBInitialized();
    global $wpdb;
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $sendStatusTable = "{$wpdb->prefix}solawim_email_send_status";

    // Set overall email status to 'processing' before sending
    $wpdb->update(
        $emailsTable,
        [ 'status' => 'processing' ],
        [ 'id' => $emailId ],
        [ '%s' ],
        [ '%d' ]
    );

    // Retrieve the email row
    $emailRow = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT subject, body FROM {$emailsTable} WHERE id = %d",
            $emailId
        ),
        ARRAY_A
    );
    if (!is_array($emailRow)) {
        return;
    }
    $subject = $emailRow['subject'] ?? '';
    $body = $emailRow['body'] ?? '';

    // Get all recipients in 'stored' status for this email
    $recipients = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT id, recipient_email FROM {$sendStatusTable} WHERE email_id = %d AND status = %s",
            $emailId,
            'stored'
        ),
        ARRAY_A
    );
    if (!is_array($recipients) || count($recipients) === 0) {
        return;
    }

    $successCount = 0;
    $failCount = 0;
    $totalCount = count($recipients);

    foreach ($recipients as $row) {
        $recipientEmail = $row['recipient_email'];
        $statusId = $row['id'];
        $success = send_email_with_wpmail($recipientEmail, $subject, $body);
        if ($success) {
            $successCount++;
        } else {
            $failCount++;
        }
        $wpdb->update(
            $sendStatusTable,
            [
                'status' => $success ? 'success' : 'failed',
                'last_updated' => current_time('mysql'),
            ],
            [ 'id' => $statusId ],
            [ '%s', '%s' ],
            [ '%d' ]
        );
    }

    // Set overall email status after sending
    $finalStatus = 'success';
    if ($successCount === 0) {
        $finalStatus = 'failed';
    } elseif ($failCount > 0) {
        $finalStatus = 'partially_failed';
    }
    $wpdb->update(
        $emailsTable,
        [ 'status' => $finalStatus ],
        [ 'id' => $emailId ],
        [ '%s' ],
        [ '%d' ]
    );
}

function reportError(string $message, Response $response, $status = 404)
{
    $response = $response->withStatus(401);
    $errorBody = json_encode(["status" => "FAIL", "message" => $message]);
    error_log('[solawim] API Error Response: ' . $errorBody);
    $response->getBody()->write($errorBody);
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
            mandateDate.mandateDate,
            um_how_found.meta_value as how_found
    FROM    {$wpdb->prefix}users u
            LEFT JOIN {$membershipTable} m on u.ID = m.user_id
            LEFT JOIN {$wpdb->prefix}usermeta um_how_found ON
                um_how_found.user_id = u.ID AND
                um_how_found.meta_key = 'how_found'
            LEFT JOIN (
                SELECT  c.user_id as user_id,
                        coalesce(min(h.createdAt), c.createdAt) as mandateDate
                FROM    {$membershipTable} c
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

function normalizeEmailList($emails): array
{
    if (!is_array($emails)) {
        return [];
    }

    $normalized = [];
    foreach ($emails as $email) {
        if (!is_string($email)) {
            continue;
        }
        $trimmed = trim($email);
        if ($trimmed === '') {
            continue;
        }
        if (!filter_var($trimmed, FILTER_VALIDATE_EMAIL)) {
            continue;
        }
        $lower = strtolower($trimmed);
        if (!array_key_exists($lower, $normalized)) {
            $normalized[$lower] = $trimmed;
        }
    }

    return array_values($normalized);
}

function solawim_parse_recipient_list($value): array
{
    if (!is_string($value) || trim($value) === '') {
        return [];
    }
    $parts = array_map(
        static function ($entry) {
            return trim((string) $entry);
        },
        explode(',', $value)
    );
    $filtered = array_filter(
        $parts,
        static function ($entry) {
            return $entry !== '';
        }
    );
    return array_values(array_unique($filtered));
}

function solawim_format_recipient_list(array $emails): string
{
    if (count($emails) === 0) {
        return '';
    }
    $normalized = array_values(
        array_unique(
            array_map(
                static function ($entry) {
                    return trim((string) $entry);
                },
                $emails
            )
        )
    );
    return implode(',', $normalized);
}

function getEffectiveRecipientEmails($recipientIds, $additionalRecipients = []): array
{
    $normalizedIds = [];
    if (is_array($recipientIds) && count($recipientIds) > 0) {
        $normalizedIds = array_values(
            array_unique(
                array_filter(
                    array_map(
                        static function ($id) {
                            return (int) $id;
                        },
                        $recipientIds,
                    ),
                    static function ($id) {
                        return $id > 0;
                    },
                ),
            ),
        );
    }

    $emailsFromUsers = [];
    if (count($normalizedIds) > 0) {
        global $wpdb;
        $placeholders = implode(',', array_fill(0, count($normalizedIds), '%d'));
        $query = "SELECT user_email FROM {$wpdb->prefix}users WHERE ID IN ({$placeholders})";
        $results = $wpdb->get_results($wpdb->prepare($query, $normalizedIds), ARRAY_A);

        if (is_array($results)) {
            $emailsFromUsers = array_map(
                static function ($row) {
                    return $row['user_email'] ?? '';
                },
                $results
            );
        }
    }

    $primaryEmails = normalizeEmailList($emailsFromUsers);
    $extras = normalizeEmailList($additionalRecipients);

    return normalizeEmailList(array_merge($primaryEmails, $extras));
}

function storeEmailData(object $content, int $accountId, array $effectiveRecipients, int $season, bool $isTestEmail): int
{
    ensureDBInitialized();
    global $wpdb;
    error_log('[solawim] Storing email data for accountId ' . $accountId . ' with ' . count($effectiveRecipients) . ' recipients.');
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $jsonContent = json_encode($content);
    $seasonValue = (int) $season;
    $body = isset($content->body) ? (string) $content->body : '';
    $subject = isset($content->subject) ? (string) $content->subject : '';
    $result = $wpdb->query(
        $wpdb->prepare(
            "
        INSERT INTO {$emailsTable} 
        (content, createdBy, createdAt, status, season, body, subject, is_test)
        VALUES(%s, %d, NOW(), %s, %d, %s, %s, %d)
        ",
            $jsonContent,
            $accountId,
            'stored',
            $seasonValue,
            $body,
            $subject,
            $isTestEmail ? 1 : 0
        )
    );
    if ($result === false) {
        return 0;
    }
    $emailId = (int) $wpdb->insert_id;

    // Insert into solawim_email_send_status for each recipient
    $sendStatusTable = "{$wpdb->prefix}solawim_email_send_status";
    foreach ($effectiveRecipients as $recipientEmail) {
        if (!is_string($recipientEmail) || trim($recipientEmail) === '') continue;
        $wpdb->insert(
            $sendStatusTable,
            [
                'email_id' => $emailId,
                'recipient_email' => $recipientEmail,
                'status' => 'stored',
                'last_updated' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s']
        );
    }
    return $emailId;
}

function solawim_mark_email_as_failed(int $emailId, string $reason): void
{
    ensureDBInitialized();
    global $wpdb;
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $wpdb->update(
        $emailsTable,
        [
            'status' => 'failed',
            'failure_reason' => $reason,
        ],
        ['id' => $emailId],
        ['%s', '%s'],
        ['%d']
    );
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

// Add error handler to log full error details
$container = $app->getContainer();
$container['errorHandler'] = function ($c) {
    return function ($request, $response, $exception) use ($c) {
        $msg = '[solawim] API Exception: ' . $exception->getMessage() . "\n" . $exception->getTraceAsString();
        error_log($msg);
        $data = [
            'status' => 'FAIL',
            'message' => 'Internal Server Error',
            'error' => [
                'type' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ],
        ];
        return $response
            ->withStatus(500)
            ->withHeader('Content-Type', 'application/json')
            ->write(json_encode($data));
    };
};

$app->get('/membership', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $season = getSeasonFromQueryString($request);
    $result = getMembershipData($userId, $season);
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/membership', function (Request $request, Response $response, array $args) {
    $userId = getUserId();
    if (!($userId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    global $seasonToMembership;
    $season = getSeasonFromQueryString($request);
    $membershipTable = $seasonToMembership[$season]["membership"];
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

    $response = $response->withHeader('Content-Type', 'application/json');
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

    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode($result));
    return $response;
});

$app->post('/email', function (Request $request, Response $response, array $args) {
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Bitte zuerst einloggen', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $season = (int) getSeasonFromQueryString($request);

    $contentString = $request->getBody()->getContents();
    if (strlen(trim($contentString)) === 0) {
        return reportError('Email data must not be empty', $response, 400);
    }

    $content = json_decode($contentString, false);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return reportError('Invalid JSON payload', $response, 400);
    }

    $validateResult = validateJson($content, 'email-data-schema.json');
    if (!is_null($validateResult)) {
        return reportError($validateResult, $response, 404);
    }

    $additionalRecipients = [];
    if (isset($content->additionalRecipients) && is_array($content->additionalRecipients)) {
        $additionalRecipients = $content->additionalRecipients;
    }

    $sanitizedAdditionalRecipients = normalizeEmailList($additionalRecipients);
    $content->additionalRecipients = $sanitizedAdditionalRecipients;

    $effectiveRecipients = getEffectiveRecipientEmails($content->recipients ?? [], $sanitizedAdditionalRecipients);

    $isTestEmail = false;
    if (isset($content->emailTest)) {
        $emailTestValue = $content->emailTest;
        if (is_bool($emailTestValue)) {
            $isTestEmail = $emailTestValue;
        } elseif (is_string($emailTestValue)) {
            $isTestEmail = filter_var($emailTestValue, FILTER_VALIDATE_BOOLEAN);
        } elseif (is_numeric($emailTestValue)) {
            $isTestEmail = ((int) $emailTestValue) === 1;
        }
    }

    global $SOLAWI_SETTINGS;
    global $senderAddress;
    global $testEmailPrefix;
    global $forRealEmailPrefix;

    if ($isTestEmail) {
        // Prefix subject
        if (isset($content->subject) && is_string($content->subject)) {
            $content->subject = $testEmailPrefix . $content->subject;
        }
        // Prepare recipient list for body
        $recipientsList = '';
        if (count($effectiveRecipients) > 0) {
            $recipientsList = "\nEmpfängerliste:\n\n" . implode("\n", $effectiveRecipients) . "\n";
        }
        // Append to body
        if (isset($content->body) && is_string($content->body)) {
            $content->body .= $recipientsList;
        } else {
            $content->body = $recipientsList;
        }
        // Remove all recipients, only send to senderAddress
        $effectiveRecipients = [];
    } else {
        // Prefix subject
        if (isset($content->subject) && is_string($content->subject)) {
            $content->subject = $forRealEmailPrefix . $content->subject;
        }
    }
    $effectiveRecipients = normalizeEmailList(array_merge($effectiveRecipients, [$senderAddress]));

    $emailId = storeEmailData($content, (int) $accountId, $effectiveRecipients, $season, $isTestEmail);

    error_log('[solawim] Email gespeichert mit ID ' . $emailId . '. Effektive Empfänger: ' . implode(', ', $effectiveRecipients));
    if ($emailId > 0) {
        if (count($effectiveRecipients) === 0 && !$isTestEmail) {
            solawim_mark_email_as_failed($emailId, 'Keine Empfänger gefunden.');
        } else {
            solawim_handle_email_sending_with_wpmail($emailId);
        }
    }

    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write('{"status": "OK"}');
    return $response->withStatus(202);
});

$app->get('/emails', function (Request $request, Response $response, array $args) {
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }

    $query = $request->getQueryParams();
    $page = isset($query['page']) ? (int) $query['page'] : 1;
    if ($page < 1) {
        $page = 1;
    }
    $pageSize = isset($query['pageSize']) ? (int) $query['pageSize'] : 25;
    if ($pageSize < 1) {
        $pageSize = 1;
    }
    if ($pageSize > 100) {
        $pageSize = 100;
    }

    ensureDBInitialized();
    global $wpdb;
    $emailsTable = "{$wpdb->prefix}solawim_emails";

    $offset = ($page - 1) * $pageSize;

    $items = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT     id, 
                        createdBy, 
                        createdAt, 
                        status, 
                        failure_reason, 
                        content,
                        season, 
                        body,
                        subject,
                        is_test
            FROM        {$emailsTable}
            ORDER BY createdAt DESC
            LIMIT %d OFFSET %d",
            $pageSize,
            $offset,
        ),
        ARRAY_A
    );
    if (!is_array($items)) {
        $items = [];
    }

    // Get all email IDs in this page
    $emailIds = array_column($items, 'id');
    $recipientStatuses = [];
    if (count($emailIds) > 0) {
        $sendStatusTable = "{$wpdb->prefix}solawim_email_send_status";
        $placeholders = implode(',', array_fill(0, count($emailIds), '%d'));
        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT email_id, recipient_email, status FROM {$sendStatusTable} WHERE email_id IN ($placeholders)",
                ...$emailIds
            ),
            ARRAY_A
        );
        // Group by email_id
        foreach ($rows as $row) {
            $eid = $row['email_id'];
            if (!isset($recipientStatuses[$eid])) {
                $recipientStatuses[$eid] = [];
            }
            $recipientStatuses[$eid][$row['recipient_email']] = [
                'status' => $row['status'],
            ];
        }
    }

    // Merge recipientStatuses and convert effective_recipients to array for each item
    foreach ($items as &$item) {
        $item['recipientStatuses'] = isset($recipientStatuses[$item['id']]) ? $recipientStatuses[$item['id']] : null;
        $item['is_test'] = $item['is_test'] == 1 ? true : false;
    }
    unset($item);

    $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$emailsTable}");

    $result = [
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => $total,
        'items' => $items,
    ];

    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode($result));
    return $response->withStatus(200);
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
        return reportError('Dir fehlen die Berechtigungen um hier fortzufahren', $response, 401);
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

    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode(getAllMemberData($season)));
    return $response->withStatus(200);
});

$app->get('/membershistory', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $season = getSeasonFromQueryString($request);
    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode(getAllMemberDataHistory($season)));
    return $response->withStatus(200);
});

$app->get('/bankingdata', function (Request $request, Response $response, array $args) {
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }
    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write('{ "holder": "Anbaustelle e.V.", "iban": "DE94522500300050033976", "bic": "HELADEF1ESW", "creditorId": "DE20ZZZ00002458365" }');
    return $response->withStatus(200);
});

$app->get('/seasons', function (Request $request, Response $response, array $args) {
    global $seasons;
    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode($seasons));
    return $response->withStatus(200);
});

$app->run();
