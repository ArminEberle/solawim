import type { EmailData } from 'src/types/EmailData';

export type EmailLogStatus = 'stored' | 'send' | 'success' | 'failed';

export type EmailLogEntry = {
    id: number;
    createdBy: number | null;
    createdAt: string;
    status: EmailLogStatus;
    failureReason: string | null;
    effectiveRecipients: string[];
    successfulRecipients: string[];
    failedRecipients: string[];
    season: number | null;
    content: EmailData | null;
};

export type EmailLogPage = {
    page: number;
    pageSize: number;
    total: number;
    items: EmailLogEntry[];
};
