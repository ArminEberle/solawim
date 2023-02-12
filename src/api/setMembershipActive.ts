import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';


export function setMembershipActive(targetUserId: string, activeMembership: boolean): Promise<void> {
    return getJsonBody(
        fetch(apiBaseUrl + 'membershipactive', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                targetUserId,
                activeMembership,
            }),
        })
    );
}
