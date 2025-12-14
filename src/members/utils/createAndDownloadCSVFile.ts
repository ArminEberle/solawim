import type { AllMembersData } from 'src/members/types/AllMembersData';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { download } from 'src/members/utils/download';
import { prices } from 'src/utils/prices';

const csvHeaders: string[] = [
    'User-ID',
    'Login-Name',
    'Name',
    'Vorname',
    'Telefon',
    'Email',
    'Abholraum',
    'Anzahl Anteile Gemuese',
    'Anzahl Anteile Brot',
    'Anzahl Anteile Fleisch',
    'Anzahl Anteile Zusatzmilch',
    'Betrag Gemuese',
    'Betrag Brot',
    'Betrag Fleisch',
    'Betrag Zusatzmilch',
    'Gesammtsumme',
    'Sepateilnahme (ja,nein)',
    'Anteile gegen Mitarbeit',
];

const stringWrap = (str: string): string => `"${str}"`;
const numberToGermanString = (num: number): string =>
    num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const createAndDownloadCSVFile = async (memberData: AllMembersData, season: number): Promise<void> => {
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
        for (const member of memberData) {
            if (!member?.membership?.member) {
                continue;
            }
            const activeMembership = member.membership.active;
            const veggieSum = calculatePositionSum({
                solidar: member.membership?.veggieSolidar,
                price: prices[season].veggie,
                amount: activeMembership ? 0 : Number.parseInt(member.membership?.veggieMenge),
            });
            const brotSum = calculatePositionSum({
                solidar: member.membership?.brotSolidar,
                price: prices[season].brot,
                amount: activeMembership ? 0 : Number.parseInt(member.membership?.brotMenge),
            });
            const fleischSum = calculatePositionSum({
                solidar: member.membership?.fleischSolidar,
                price: prices[season].fleisch,
                amount: activeMembership ? 0 : Number.parseInt(member.membership?.fleischMenge),
            });
            const milchSum = calculatePositionSum({
                solidar: member.membership?.milchSolidar,
                price: prices[season].milch,
                amount: activeMembership ? 0 : Number.parseInt(member.membership?.milchMenge ?? '0'),
            });
            const line = [
                member.id,
                stringWrap(member.user_nicename),
                stringWrap(member.membership?.lastname ?? ''),
                stringWrap(member.membership?.firstname ?? ''),
                stringWrap('TEL ' + (member.membership?.tel ?? '')),
                stringWrap(member.user_email),
                stringWrap(member.membership?.abholraum ?? ''),
                member.membership?.veggieMenge ?? 0,
                member.membership?.brotMenge ?? 0,
                member.membership?.fleischMenge ?? 0,
                member.membership?.milchMenge ?? 0,
                numberToGermanString(veggieSum),
                numberToGermanString(brotSum),
                numberToGermanString(fleischSum),
                numberToGermanString(milchSum),
                numberToGermanString(veggieSum + brotSum + fleischSum + milchSum),
                stringWrap(member.membership?.useSepa ? 'JA' : 'NEIN'),
                stringWrap(member.membership?.active ? 'JA' : 'NEIN'),
            ].join(';');
            csvLines.push(line);
        }

        download(
            `Solawi_Daten_${year}_${monthPadded}_${dayPadded}_${hourPadded}${minutePadded}${secondPadded}.csv`,
            csvLines.join('\r\n'),
            'text/csv',
        );
    } catch (e) {
        alert('Ein Problem ist aufgetreten siehe console.log: ' + String(e));
        console.log(e);
    }
};
