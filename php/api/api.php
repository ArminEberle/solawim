<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use JsonSchema\Validator as Validator;
use JsonSchema\Constraints\Constraint;

require_once(__DIR__ . '/../../../../wp-load.php');

if (!function_exists('as_enqueue_async_action')) {
    $actionSchedulerBootstrap = __DIR__ . '/vendor/woocommerce/action-scheduler/action-scheduler.php';
    if (file_exists($actionSchedulerBootstrap)) {
        require_once $actionSchedulerBootstrap;
        if (function_exists('action_scheduler_initialize_3_dot_9_dot_3')) {
            action_scheduler_initialize_3_dot_9_dot_3();
            if (class_exists('ActionScheduler_Versions')) {
                ActionScheduler_Versions::initialize_latest_version();
            }
        } elseif (class_exists('ActionScheduler')) {
            ActionScheduler::init($actionSchedulerBootstrap);
        }
    }
}

global $wpdb;
$dbInitialized = false;
$SOLAWI_SETTINGS = [
    'EmailSenderAddress' => '',
];

const SOLAWIM_SEND_EMAIL_HOOK = 'solawim_send_email_async';

if (function_exists('add_action')) {
    add_action(SOLAWIM_SEND_EMAIL_HOOK, 'solawim_handle_email_sending', 10, 1);
}

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
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $wpdb->get_results(
        "CREATE TABLE IF NOT EXISTS `{$emailsTable}` (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            createdBy BIGINT UNSIGNED,
            content JSON,
            createdAt DATETIME,
            effective_recipients TEXT,
            successful_recipients TEXT,
            failed_recipients TEXT,
            status ENUM('stored', 'send', 'success', 'failed') DEFAULT 'stored',
            failure_reason TEXT,
            season INT,
            INDEX idx_solawim_emails_createdBy (createdBy)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        ARRAY_A
    ); 
    $columnChecks = [
        'effective_recipients' => "ALTER TABLE `{$emailsTable}` ADD COLUMN effective_recipients TEXT",
        'successful_recipients' => "ALTER TABLE `{$emailsTable}` ADD COLUMN successful_recipients TEXT",
        'failed_recipients' => "ALTER TABLE `{$emailsTable}` ADD COLUMN failed_recipients TEXT",
        'status' => "ALTER TABLE `{$emailsTable}` ADD COLUMN status ENUM('stored', 'send', 'success', 'failed') DEFAULT 'stored'",
        'failure_reason' => "ALTER TABLE `{$emailsTable}` ADD COLUMN failure_reason TEXT",
        'season' => "ALTER TABLE `{$emailsTable}` ADD COLUMN season INT",
    ];
    foreach ($columnChecks as $columnName => $alterSql) {
        $columnExists = $wpdb->get_results(
            $wpdb->prepare("SHOW COLUMNS FROM `{$emailsTable}` LIKE %s", $columnName),
            ARRAY_A
        );
        if (count($columnExists) === 0) {
            $wpdb->get_results($alterSql, ARRAY_A);
        }
    }

    $settingsTable = "{$wpdb->prefix}solawim_settings";
    $wpdb->get_results(
        "CREATE TABLE IF NOT EXISTS `{$settingsTable}` (
            `key` VARCHAR(191) PRIMARY KEY,
            `value` TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        ARRAY_A
    );
    $dbInitialized = true;
    return;
}

function loadSolawiSettings(): void
{
    global $wpdb;
    global $SOLAWI_SETTINGS;

    ensureDBInitialized();

    $settingsTable = "{$wpdb->prefix}solawim_settings";
    $rows = $wpdb->get_results("SELECT `key`, `value` FROM `{$settingsTable}`", ARRAY_A);
    if (!is_array($rows)) {
        return;
    }

    foreach ($rows as $row) {
        $key = $row['key'] ?? null;
        if (!is_string($key)) {
            continue;
        }
        if (!array_key_exists($key, $SOLAWI_SETTINGS)) {
            continue;
        }
        $SOLAWI_SETTINGS[$key] = $row['value'] ?? '';
    }
}

loadSolawiSettings();

function getSolawiSettings(): array
{
    ensureDBInitialized();
    global $SOLAWI_SETTINGS;
    return $SOLAWI_SETTINGS;
}

function saveSolawiSettings(array $newSettings): array
{
    ensureDBInitialized();
    global $SOLAWI_SETTINGS;
    global $wpdb;

    $settingsTable = "{$wpdb->prefix}solawim_settings";

    foreach ($SOLAWI_SETTINGS as $key => $currentValue) {
        if (!array_key_exists($key, $newSettings)) {
            continue;
        }
        $rawValue = $newSettings[$key];
        if (is_array($rawValue) || is_object($rawValue)) {
            $rawValue = '';
        }
        $value = (string) $rawValue;
        if ($key === 'EmailSenderAddress') {
            $value = sanitize_email($value);
        } else {
            $value = sanitize_text_field($value);
        }
        $SOLAWI_SETTINGS[$key] = $value;
        $wpdb->replace(
            $settingsTable,
            [
                'key' => $key,
                'value' => $value,
            ],
            ['%s', '%s']
        );
    }

    return $SOLAWI_SETTINGS;
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

function storeEmailData(object $content, int $accountId, array $effectiveRecipients, int $season): int
{
    ensureDBInitialized();
    global $wpdb;
    $emailsTable = "{$wpdb->prefix}solawim_emails";
    $jsonContent = json_encode($content);
    $effectiveRecipientsString = implode(',', $effectiveRecipients);
    $seasonValue = (int) $season;
    $result = $wpdb->query(
        $wpdb->prepare(
            "
        INSERT INTO {$emailsTable} (content, createdBy, createdAt, status, effective_recipients, successful_recipients, failed_recipients, season)
        VALUES(%s, %d, NOW(), %s, %s, %s, %s, %d)
        ",
            $jsonContent,
            $accountId,
            'stored',
            $effectiveRecipientsString,
            '',
            '',
            $seasonValue
        )
    );
    if ($result === false) {
        return 0;
    }
    return (int) $wpdb->insert_id;
}

function solawim_queue_email_send(int $emailId): void
{
    if ($emailId <= 0) {
        return;
    }
    if (function_exists('as_enqueue_async_action')) {
        as_enqueue_async_action(SOLAWIM_SEND_EMAIL_HOOK, [$emailId]);
        return;
    }
    error_log('[solawim] Action Scheduler is not available, cannot send email asynchronously.');
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

function solawim_handle_email_sending(int $emailId): void
{
    $emailId = (int) $emailId;
    if ($emailId <= 0) {
        return;
    }

    ensureDBInitialized();
    global $wpdb;
    $emailsTable = "{$wpdb->prefix}solawim_emails";

    $row = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT id, content, status, failure_reason, effective_recipients, successful_recipients, failed_recipients
            FROM {$emailsTable}
            WHERE id = %d",
            $emailId
        ),
        ARRAY_A
    );

    if (!is_array($row)) {
        return;
    }

    $effectiveRecipients = solawim_parse_recipient_list($row['effective_recipients'] ?? '');
    if (count($effectiveRecipients) === 0) {
        solawim_mark_email_as_failed($emailId, 'Keine gültigen Empfänger verfügbar.');
        return;
    }

    $successfulRecipients = solawim_parse_recipient_list($row['successful_recipients'] ?? '');
    $failedRecipients = solawim_parse_recipient_list($row['failed_recipients'] ?? '');

    $sentOrFailed = array_merge($successfulRecipients, $failedRecipients);
    $remainingRecipients = array_values(array_diff($effectiveRecipients, $sentOrFailed));

    if (count($remainingRecipients) === 0) {
        $finalStatus = count($failedRecipients) === 0 ? 'success' : 'failed';
        $updateData = ['status' => $finalStatus];
        $updateFormat = ['%s'];
        if ($finalStatus === 'success') {
            $updateData['failure_reason'] = '';
            $updateFormat[] = '%s';
        } elseif (empty($row['failure_reason'])) {
            $updateData['failure_reason'] = 'Mindestens eine E-Mail konnte nicht zugestellt werden.';
            $updateFormat[] = '%s';
        }
        $wpdb->update($emailsTable, $updateData, ['id' => $emailId], $updateFormat, ['%d']);
        return;
    }

    $nextRecipient = array_shift($remainingRecipients);

    $content = json_decode((string) ($row['content'] ?? ''), true);
    if (!is_array($content)) {
        $content = [];
    }

    $subject = isset($content['subject']) ? (string) $content['subject'] : '';
    $body = isset($content['body']) ? (string) $content['body'] : '';

    $headers = [];
    global $SOLAWI_SETTINGS;
    $senderAddress = $SOLAWI_SETTINGS['EmailSenderAddress'] ?? '';
    if (is_string($senderAddress) && filter_var($senderAddress, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'From: ' . $senderAddress;
    }

    $sendResult = wp_mail($nextRecipient, $subject, $body, $headers);

    if ($sendResult) {
        $successfulRecipients[] = $nextRecipient;
        $wpdb->update(
            $emailsTable,
            [
                'status' => 'send',
                'successful_recipients' => solawim_format_recipient_list($successfulRecipients),
            ],
            ['id' => $emailId],
            ['%s', '%s'],
            ['%d']
        );
    } else {
        $failedRecipients[] = $nextRecipient;
        $timestamp = gmdate('c');
        $existingFailureReason = (string) ($row['failure_reason'] ?? '');
        $failureMessage = "Fehler beim Versand an {$nextRecipient} ({$timestamp})";
        if ($existingFailureReason !== '') {
            $failureMessage = $existingFailureReason . PHP_EOL . $failureMessage;
        }
        $wpdb->update(
            $emailsTable,
            [
                'status' => 'send',
                'failed_recipients' => solawim_format_recipient_list($failedRecipients),
                'failure_reason' => $failureMessage,
            ],
            ['id' => $emailId],
            ['%s', '%s', '%s'],
            ['%d']
        );
    }

    $sentOrFailed = array_merge($successfulRecipients, $failedRecipients);
    $remainingRecipients = array_values(array_diff($effectiveRecipients, $sentOrFailed));

    if (count($remainingRecipients) === 0) {
        $finalStatus = count($failedRecipients) === 0 ? 'success' : 'failed';
        $updateData = ['status' => $finalStatus];
        $updateFormat = ['%s'];
        if ($finalStatus === 'success') {
            $updateData['failure_reason'] = '';
            $updateFormat[] = '%s';
        }
        $wpdb->update($emailsTable, $updateData, ['id' => $emailId], $updateFormat, ['%d']);
        return;
    }

    if (function_exists('as_schedule_single_action')) {
        as_schedule_single_action(time() + 1, SOLAWIM_SEND_EMAIL_HOOK, [$emailId]);
        return;
    }

    solawim_queue_email_send($emailId);
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

$app->post('/email', function (Request $request, Response $response, array $args) {
    $season = (int) getSeasonFromQueryString($request);
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }

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

    $emailId = storeEmailData($content, (int) $accountId, $effectiveRecipients, $season);

    if ($emailId > 0) {
        if (count($effectiveRecipients) === 0) {
            solawim_mark_email_as_failed($emailId, 'Keine Empfänger gefunden.');
        } else {
            solawim_queue_email_send($emailId);
        }
    }

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
            "SELECT id, createdBy, createdAt, status, failure_reason, effective_recipients, successful_recipients, failed_recipients, season, content
            FROM {$emailsTable}
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

    $total = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$emailsTable}");

    $result = [
        'page' => $page,
        'pageSize' => $pageSize,
        'total' => $total,
        'items' => $items,
    ];

    $response->getBody()->write(json_encode($result));
    return $response->withStatus(200);
});

$app->get('/settings', function (Request $request, Response $response, array $args) {
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }

    $settings = getSolawiSettings();
    $response->getBody()->write(json_encode($settings));
    return $response->withStatus(200);
});

$app->post('/settings', function (Request $request, Response $response, array $args) {
    $accountId = getUserId();
    if (!($accountId > 0)) {
        return reportError('Please login before proceeding', $response, 401);
    }
    $checkResult = checkUserIsVereinsverwaltung($request, $response);
    if (!is_null($checkResult)) {
        return $checkResult;
    }

    $contentString = $request->getBody()->getContents();
    if (strlen(trim((string) $contentString)) === 0) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['status' => 'FAIL', 'message' => 'Einstellungen dürfen nicht leer sein.']));
        return $response;
    }

    $content = json_decode($contentString, true);
    if (!is_array($content)) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['status' => 'FAIL', 'message' => 'Ungültiges JSON für Einstellungen.']));
        return $response;
    }

    $updatedSettings = saveSolawiSettings($content);
    $response->getBody()->write(json_encode($updatedSettings));
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
    $response->getBody()->write('{ "holder": "Anbaustelle e.V.", "iban": "DE94522500300050033976", "bic": "HELADEF1ESW", "creditorId": "DE20ZZZ00002458365" }');
    return $response->withStatus(200);
});

$app->get('/seasons', function (Request $request, Response $response, array $args) {
    global $seasons;
    $response->getBody()->write(json_encode($seasons));
    return $response->withStatus(200);
});

$app->run();
