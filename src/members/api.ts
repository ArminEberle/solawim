import { AllMembersData } from 'src/members/types/AllMembersData';
import { MembershipData } from 'src/members/types/MembershipData';
import { PersonData } from 'src/members/types/PersonData';
import { SepaData } from 'src/members/types/SepaData';
import { StaticData } from 'src/members/types/StaticData';

const apiBaseUrl = '/wp-content/plugins/solawim/api/';

async function getJsonBody(
    response: Response | Promise<Response>
): Promise<any> {
    const resolvedResponse = await response;
    let content = await resolvedResponse.json();
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content);
        } catch (e) {
            throw new Error('Error while parsing response: ' + e);
        }
    }
    if (resolvedResponse.status !== 200) {
        throw new Error('Serverside error: ' + content.message);
    }
    return content;
}

export const getStatic = (): Promise<StaticData> =>
    getJsonBody(fetch(apiBaseUrl + 'statics'));

export const getMembership = (): Promise<MembershipData> =>
    getJsonBody(fetch(apiBaseUrl + 'membership'));

export const setMembership = (data: MembershipData | null): Promise<void> =>
    getJsonBody(
        fetch(apiBaseUrl + 'membership', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : '',
        })
    );

export const setMembershipActive = (targetUserId: string, activeMembership: boolean): Promise<void> =>
    getJsonBody(
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

export const getPersonData = (): Promise<PersonData> =>
    getJsonBody(fetch(apiBaseUrl + 'personal'));

export const setPersonData = (data: PersonData | null): Promise<void> =>
    getJsonBody(
        fetch(apiBaseUrl + 'personal', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : '',
        })
    );

export const getSepaData = (): Promise<SepaData> =>
    getJsonBody(fetch(apiBaseUrl + 'sepa'));

export const getAllMemberData = (): Promise<AllMembersData> =>
    getJsonBody(fetch(apiBaseUrl + 'members'));


export const setSepaData = (data: SepaData | null): Promise<void> =>
    getJsonBody(
        fetch(apiBaseUrl + 'sepa', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : '',
        })
    );

export const isLoggedIn = async(): Promise<boolean> => {
    const response = await fetch(apiBaseUrl + 'loggedin', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        return true;
    }
    return false;
};