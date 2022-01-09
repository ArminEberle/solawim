import { MembershipData } from './structs/MembershipData';
import { StaticData } from './structs/StaticData';

export const getStatic = async(): Promise<StaticData> => {
    const fetchResponse = await fetch('api/statics');
    const content = await fetchResponse.json();
    if (fetchResponse.status !== 200) {
        throw new Error(content.message);
    }
    return content;
};

export const getMembership = async(): Promise<MembershipData> => {
    const fetchResponse = await fetch('api/membership');
    const content = await fetchResponse.json();
    if (fetchResponse.status !== 200) {
        throw new Error(content.message);
    }
    return content;
};

export const setMembership = async(data: MembershipData): Promise<void> => {
    const fetchResponse = await fetch('api/membership', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    const content = await fetchResponse.json();
    if (fetchResponse.status !== 200) {
        throw new Error(content.message);
    }
};