import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { MemberData } from 'src/members/types/MemberData';
import { MemberDataAdmin } from 'src/members/types/MemberDataAdmin';


export function setMemberData(data: MemberDataAdmin | null): Promise<MemberData> {
    return getJsonBody(
        fetch(apiBaseUrl + 'membership-admin', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : '',
        })
    );
}