import { apiBaseUrl } from 'src/api/apiBaseUrl';
import type { EmailData } from 'src/types/EmailData';

export type SendEmailResponse = {
    status: string;
};

export type SendEmailPayload = {
    season: number;
    emailData: EmailData;
    attachments?: File[];
};

export const sendEmail = async ({ season, emailData, attachments }: SendEmailPayload): Promise<SendEmailResponse> => {
    const url = `${apiBaseUrl}email?season=${encodeURIComponent(String(season))}`;

    const formData = new FormData();
    formData.append('emailData', JSON.stringify(emailData));
    if (attachments) {
        for (const file of attachments) {
            formData.append('attachments[]', file);
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
        },
        body: formData,
    });

    const responseText = await response.text();

    let parsedBody: any = responseText;
    if (responseText.length > 0) {
        try {
            parsedBody = JSON.parse(responseText);
        } catch (error) {
            throw new Error('Error while parsing response: ' + error);
        }
    }

    if (!response.ok) {
        const errorMessage = parsedBody?.message ?? response.statusText;
        throw new Error('Serverside error: ' + errorMessage);
    }

    try {
    } catch (error) {
        console.warn('Unable to trigger wp-cron after queuing email', error);
    }

    if (typeof parsedBody === 'string') {
        return { status: parsedBody };
    }

    return parsedBody;
};
