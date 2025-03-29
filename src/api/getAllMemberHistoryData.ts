import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { AllMembersHistoryData } from 'src/members/types/AllMembersData';

export async function getAllMemberHistoryData(): Promise<AllMembersHistoryData> {
    try {
        const fetchResult = await fetch(apiBaseUrl + 'membershistory');
        return await getJsonBody(fetchResult);
    } catch (e) {
        alert(e);
        return [];
    }
}
