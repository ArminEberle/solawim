import type { EmailData } from 'src/types/EmailData';

export type EmailLogStatus = 'stored' | 'processing' | 'success' | 'failed' | 'partially_failed';

export type EmailLogEntry = {
    id: number;
    createdBy: number | null;
    createdAt: string;
    status: EmailLogStatus;
    failureReason: string | null;
    season: number | null;
    content: EmailData | null;
    is_test: boolean;
    subject?: string | null;
    body?: string | null;
    recipientStatuses?: Record<string, { status: string; statusCode: string | null }> | null;
};

export type EmailLogPage = {
    page: number;
    pageSize: number;
    total: number;
    items: EmailLogEntry[];
};
