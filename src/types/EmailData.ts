import type { MailRecipientsSelection } from 'src/members/types/MailRecipientsSelection';

/**
 * Represents the data required to send an email to multiple recipients.
 */
export type EmailData = {
    /**
     * Marks the email as a test. In test mode the message is only sent to the configured sender address
     * and appends the list of intended recipients at the end of the body.
     */
    emailTest?: boolean;
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
    /**
     * Additional e-mail addresses that should receive the mailing alongside the primary member accounts.
     */
    additionalRecipients?: string[];
    /**
     * Captures the selection parameters that produced the recipient list.
     */
    selection: MailRecipientsSelection;
};
