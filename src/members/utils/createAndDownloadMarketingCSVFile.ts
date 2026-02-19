import type { UserMarketingData } from 'src/types/UserMarketingData';
import { download } from 'src/members/utils/download';

const csvHeaders: string[] = [
    'User-ID',
    'Login-Name',
    'Email',
    'Anzeigename',
    'Vorname',
    'Nachname',
    'Registriert am',
    'Letzter Login',
    'Mitglied in aktueller Saison',
    'Wie bist Du auf uns aufmerksam geworden?',
];

const stringWrap = (str: string): string => `"${str}"`;

const safeString = (value: string | null | undefined): string => value ?? '';

const boolToText = (value: boolean | null | undefined): string => {
    if (value === true) {
        return 'JA';
    }
    if (value === false) {
        return 'NEIN';
    }
    return '';
};

export const createAndDownloadMarketingCSVFile = async (data: UserMarketingData): Promise<void> => {
    try {
        const date = new Date();
        const year = date.getFullYear();
        const monthPadded = String(date.getMonth() + 1).padStart(2, '0');
        const dayPadded = String(date.getDate()).padStart(2, '0');
        const hourPadded = String(date.getHours()).padStart(2, '0');
        const minutePadded = String(date.getMinutes()).padStart(2, '0');
        const secondPadded = String(date.getSeconds()).padStart(2, '0');

        const csvLines: string[] = [];
        csvLines.push(csvHeaders.join(';'));

        for (const entry of data) {
            const line = [
                entry.id,
                stringWrap(entry.user_login),
                stringWrap(entry.user_email),
                stringWrap(entry.display_name),
                stringWrap(safeString(entry.first_name)),
                stringWrap(safeString(entry.last_name)),
                stringWrap(entry.user_registered),
                stringWrap(safeString(entry.last_login)),
                stringWrap(boolToText(entry.is_member)),
                stringWrap(safeString(entry.how_found)),
            ].join(';');
            csvLines.push(line);
        }

        download(
            `Solawi_Marketing_${year}_${monthPadded}_${dayPadded}_${hourPadded}${minutePadded}${secondPadded}.csv`,
            csvLines.join('\r\n'),
            'text/csv',
        );
    } catch (e) {
        alert('Ein Problem ist aufgetreten siehe console.log: ' + String(e));
        console.log(e);
    }
};
