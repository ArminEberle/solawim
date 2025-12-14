import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { EmailData } from 'src/types/EmailData';
import type { EmailLogEntry, EmailLogPage, EmailLogStatus } from 'src/types/EmailLog';

type RawEmailLogItem = {
    id?: unknown;
    createdBy?: unknown;
    createdAt?: unknown;
    status?: unknown;
    failure_reason?: unknown;
    effective_recipients?: unknown;
    successful_recipients?: unknown;
    failed_recipients?: unknown;
    season?: unknown;
    content?: unknown;
};

type RawEmailLogResponse = {
    page?: unknown;
    pageSize?: unknown;
    total?: unknown;
    items?: unknown;
};

const coerceNumber = (value: unknown): number | null => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numeric)) {
        return null;
    }
    return numeric;
};

const parseEmailContent = (content: unknown): EmailData | null => {
    if (!content) {
        return null;
    }
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content) as EmailData;
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        } catch (error) {
            console.warn('Unable to parse stored email content', error);
        }
        return null;
    }
    if (typeof content === 'object') {
        return content as EmailData;
    }
    return null;
};

const parseRecipients = (raw: unknown): string[] => {
    if (typeof raw !== 'string') {
        return [];
    }
    return raw
        .split(',')
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
};

const parseStatus = (status: unknown): EmailLogStatus => {
    if (status === 'send' || status === 'success' || status === 'failed') {
        return status;
    }
    return 'stored';
};

const transformItem = (item: RawEmailLogItem): EmailLogEntry => {
    const id = coerceNumber(item.id) ?? 0;
    const createdBy = coerceNumber(item.createdBy);
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : '';
    const status = parseStatus(item.status);
    const failureReason = typeof item.failure_reason === 'string' ? item.failure_reason : null;
    const effectiveRecipients = parseRecipients(item.effective_recipients);
    const successfulRecipients = parseRecipients(item.successful_recipients);
    const failedRecipients = parseRecipients(item.failed_recipients);
    const season = coerceNumber(item.season);
    const content = parseEmailContent(item.content);

    return {
        id,
        createdBy,
        createdAt,
        status,
        failureReason,
        effectiveRecipients,
        successfulRecipients,
        failedRecipients,
        season,
        content,
    };
};

const buildQuery = (page: number, pageSize: number): string => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return params.toString();
};

export const getEmails = async (page = 1, pageSize = 25): Promise<EmailLogPage> => {
    const response = (await getJsonBody(
        fetch(`${apiBaseUrl}emails?${buildQuery(page, pageSize)}`),
    )) as RawEmailLogResponse;

    const resolvedPage = coerceNumber(response.page) ?? page;
    const resolvedPageSize = coerceNumber(response.pageSize) ?? pageSize;
    const total = coerceNumber(response.total) ?? 0;

    const itemsArray = Array.isArray(response.items) ? (response.items as RawEmailLogItem[]) : [];

    return {
        page: resolvedPage,
        pageSize: resolvedPageSize,
        total,
        items: itemsArray.map(transformItem),
    };
};
