/**
 * Represents the data required to send an email to multiple recipients.
 */
export type EmailData = {
    /**
     * If set, the email will be sent only to this address for testing purposes.
     * It will contain all intended recipients in the body of the email, below the main content.
     */
    testReceiver?: string;
    /**
     * List of email recipients, as user IDs in the system.
     * Only active users will receive the email.
     */
    recipients: string[];
    /**
     * The subject of the email. Plain text only.
     */
    subject: string;
    /**
     * The body of the email. Plain text only.
     */
    body: string;
};
