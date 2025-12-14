import { apiBaseUrl } from 'src/api/apiBaseUrl';
import type { EmailData } from 'src/types/EmailData';

export type SendEmailResponse = {
    status: string;
};

export type SendEmailPayload = {
    season: number;
    emailData: EmailData;
};

export const sendEmail = async ({ season, emailData }: SendEmailPayload): Promise<SendEmailResponse> => {
    const url = `${apiBaseUrl}email?season=${encodeURIComponent(String(season))}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
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

    if (typeof parsedBody === 'string') {
        return { status: parsedBody };
    }

    return parsedBody;
};
