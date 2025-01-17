export const emptyMemberData = (): MemberData => {
    return {
        member: false,
        active: false,

        brotMenge: '0',
        brotSolidar: '0',
        fleischMenge: '0',
        fleischSolidar: '0',
        milchMenge: '0',
        milchSolidar: '0',
        veggieMenge: '0',
        veggieSolidar: '0',

        abholraum: undefined,

        firstname: '',
        lastname: '',
        street: '',
        plz: '',
        city: '',
        tel: '',

        useSepa: true,
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

type Solidar = '-2' | '-1' | '0' | '1' | '2';

export type Abholraum = 'hutzelberghof' | 'witzenhausen' | 'gertenbach';

export type MemberData = {
    member: boolean;
    active: boolean;

    brotMenge: ZeroTo30;
    brotSolidar: Solidar;
    fleischMenge: ZeroTo30;
    fleischSolidar: Solidar;
    milchMenge?: ZeroTo30;
    milchSolidar?: Solidar;
    veggieMenge: ZeroTo30;
    veggieSolidar: Solidar;

    abholraum?: Abholraum;

    firstname: string;
    lastname: string;
    street: string;
    plz: string;
    city: string;
    tel: string;

    useSepa?: boolean;
    mandateDate?: string;
    iban: string;
    bic: string;
    bank: string;
    accountowner: string;
    accountownerStreet: string;
    accountownerPlz: string;
    accountownerCity: string;
};