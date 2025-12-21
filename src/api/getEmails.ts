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
    season?: unknown;
    content?: unknown;
    recipientStatuses?: Record<string, { status: string; statusCode: string | null }> | null;
    subject?: string;
    body?: string;
    is_test?: boolean;
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

const transformItem = (item: RawEmailLogItem): EmailLogEntry => {
    const id = coerceNumber(item.id) ?? 0;
    const createdBy = coerceNumber(item.createdBy);
    const createdAt = typeof item.createdAt === 'string' ? item.createdAt : '';
    const status = (item.status as EmailLogStatus) ?? 'stored';
    const failureReason = typeof item.failure_reason === 'string' ? item.failure_reason : null;
    const season = coerceNumber(item.season);
    const content = parseEmailContent(item.content);

    return {
        id,
        createdBy,
        createdAt,
        status,
        failureReason,
        season,
        content,
        recipientStatuses: item.recipientStatuses ?? {},
        subject: typeof item.subject === 'string' ? item.subject : null,
        body: typeof item.body === 'string' ? item.body : null,
        is_test: item.is_test === true,
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
