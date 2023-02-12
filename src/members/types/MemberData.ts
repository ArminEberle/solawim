export const emptyMemberData = (): MemberData => {
    return {
        member: false,
        active: false,

        brotMenge: '0',
        brotSolidar: '0',
        fleischMenge: '0',
        fleischSolidar: '0',
        veggieMenge: '0',
        veggieSolidar: '0',

        abholraum: 'hutzelberghof',

        firstname: '',
        lastname: '',
        street: '',
        plz: '',
        city: '',
        tel: '',

        iban: '',
        bic: '',
        bank: '',
        accountowner: '',
        accountownerStreet: '',
        accountownerPlz: '',
        accountownerCity: '',
    };
};

type ZeroTo30 = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
| '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19'
| '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30';

type ZeroAndHalfTo30 = '0' | '0.5' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
| '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19'
| '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30';

type Solidar = '-2' | '-1' | '0' | '1' | '2';

export type MemberData = {
    member: boolean;
    active: boolean;

    brotMenge: ZeroTo30,
    brotSolidar: Solidar,
    fleischMenge: ZeroAndHalfTo30,
    fleischSolidar: Solidar,
    veggieMenge: ZeroTo30,
    veggieSolidar: Solidar,

    abholraum: 'hutzelberghof' | 'witzenhausen' | 'gertenbach',

    firstname: string,
    lastname: string,
    street: string,
    plz: string,
    city: string,
    tel: string,

    iban: string,
    bic: string,
    bank: string,
    accountowner: string,
    accountownerStreet: string,
    accountownerPlz: string,
    accountownerCity: string,
};