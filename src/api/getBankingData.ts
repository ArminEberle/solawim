import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import { BankingData } from 'src/members/types/BankingData';

export async function getBankingData(): Promise<BankingData | null> {
    try {
        const fetchResult = await fetch(apiBaseUrl + 'bankingdata');
        return await getJsonBody(fetchResult);
    } catch (e) {
        alert(e);
        return null;
    }
}