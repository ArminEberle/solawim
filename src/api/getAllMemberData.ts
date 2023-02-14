import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { AllMembersData } from 'src/members/types/AllMembersData';

export async function getAllMemberData(): Promise<AllMembersData> {
    try {
        const fetchResult = await fetch(apiBaseUrl + 'members');
        return await getJsonBody(fetchResult);
    } catch (e) {
        alert(e);
        return [];
    }
}