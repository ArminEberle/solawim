import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { AllMembersData } from 'src/members/types/AllMembersData';

export function getAllMemberData(): Promise<AllMembersData> {
    return getJsonBody(fetch(apiBaseUrl + 'members'));
}