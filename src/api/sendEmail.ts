import { apiBaseUrl } from 'src/api/apiBaseUrl';
import type { EmailData } from 'src/types/EmailData';

export type SendEmailResponse = {
    status: string;
};

export async function sendEmail(emailData: EmailData): Promise<SendEmailResponse> {
    const response = await fetch(apiBaseUrl + 'email', {
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
}
