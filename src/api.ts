import { MembershipData } from './structs/MembershipData';
import { PersonData } from './structs/PersonData';
import { SepaData } from './structs/SepaData';
import { StaticData } from './structs/StaticData';

async function getJsonBody(response: Response | Promise<Response>): Promise<any> {
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

export const getStatic = (): Promise<StaticData> => getJsonBody(fetch('api/statics'));

export const getMembership = (): Promise<MembershipData> => getJsonBody(fetch('api/membership'));

export const setMembership = (data: MembershipData | null): Promise<void> => getJsonBody(
    fetch('api/membership', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : '',
    })
);

export const getPersonData = (): Promise<PersonData> => getJsonBody(fetch('api/personal'));

export const setPersonData = (data: PersonData | null): Promise<void> => getJsonBody(
    fetch('api/personal', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : '',
    })
);

export const getSepaData = (): Promise<SepaData> => getJsonBody(fetch('api/sepa'));

export const setSepaData = (data: SepaData | null): Promise<void> => getJsonBody(
    fetch('api/sepa', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : '',
    })
);