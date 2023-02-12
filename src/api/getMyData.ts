import isEqual from 'lodash.isequal';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import { isDeveloping } from 'src/api/isDeveloping';
import type { MemberData } from 'src/members/types/MemberData';
import { emptyMemberData } from 'src/members/types/MemberData';

export const getMyData = async(): Promise<MemberData> => {
    if (isDeveloping) {
        return new Promise((resolve, fail) => {
            setTimeout(() => {
                resolve({
                    ...emptyMemberData(),
                    member: true,
                    firstname: 'A',
                    lastname: 'Grill',
                    brotMenge: '2',
                    street: 'Blastrasse 2',
                    plz: '12345',
                    city: 'Karlsruhe',
                    tel: '23423432',
                    iban: 'DE1212',
                    accountowner: 'ASDFASDFASDF',
                    accountownerCity: 'ASDFASDF',
                    accountownerPlz: '123',
                    accountownerStreet: 'asdfwerew',
                    bic: '12345678',
                    bank: 'Sparkasse',

                });
            }, 500);
        });
    }
    const serverResult = await getJsonBody(await fetch(apiBaseUrl + 'membership'));
    if (isEqual(serverResult, {})) {
        return emptyMemberData();
    }
    return serverResult;
};