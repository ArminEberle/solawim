import { AllMembersData } from './structs/AllMembersData';
import { MembershipData } from './structs/MembershipData';
import { PersonData } from './structs/PersonData';
import { SepaData } from './structs/SepaData';
import { StaticData } from './structs/StaticData';
import Vuex from 'vuex';

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

type GlobalState = {
    membership: MembershipData;
    personal: PersonData;
    sepa: SepaData;
    staticData: StaticData;
    currentState: string | null;
    initialized: boolean;
};

const initialState: GlobalState = {
    currentState: 'Lade Daten',
    membership: {
        applied: false,
        orders: {
            bread: {
                count: 0,
                factor: 0,
            },
            meat: {
                count: 0,
                factor: 0,
            },
        },
        pos: 'hutzelberghof',
        signed: false,
        lastModified: undefined,
    },
    personal: {
        firstname: '',
        lastname: '',
        street: '',
        zip: 0,
        city: '',
        phone: '',
    },
    sepa: {
        name: '',
        street: '',
        zip: 0,
        city: '',
        iban: '',
        bic: '',
        bank: '',
    },
    staticData: {
        app: {
            pos: {},
            products: {
                bread: {
                    price: 0,
                    target: 0,
                },
                meat: {
                    price: 0,
                    target: 0,
                },
            },
        },
        userName: '',
    },
    initialized: false,
};

let store: any;

export const getStore = () => {
    if (!store) {
        store = new Vuex.Store({
            state: initialState,
            mutations: {
                staticData(state: GlobalState, staticData: StaticData) {
                    state.staticData = staticData;
                },
                membership(state: GlobalState, membership: MembershipData) {
                    state.membership = membership;
                },
                person(state: GlobalState, personData: PersonData) {
                    state.personal = personData;
                },
                sepa(state: GlobalState, sepaData: SepaData) {
                    state.sepa = sepaData;
                },
                currentState(state: GlobalState, currentState: string) {
                    state.currentState = currentState;
                },
            },
            actions: {
                initialize({ commit }) {
                    getStatic()
                        .then(result => commit('staticData', result))
                        .catch(e => commit('currentState', e));
                    getMembership()
                        .then(result => commit('membership', result))
                        .catch(e => commit('currentState', e));
                    getPersonData()
                        .then(result => commit('person', result))
                        .catch(e => commit('currentState', e));
                    getSepaData()
                        .then(result => commit('sepa', result))
                        .catch(e => commit('currentState', e));
                },
            },
            getters: {
                productPrice: (state: GlobalState) => (product: ('meat' | 'bread'), factor: number) => {
                    const basePrice = state.staticData.app.products[product].price;
                    if (factor === 0) {
                        return basePrice;
                    }
                    if (factor < 0) {
                        return basePrice - Math.floor(basePrice * 0.25);
                    }
                    return basePrice + Math.floor(basePrice * 0.25);
                },
                productSum: (state: GlobalState) => (product: ('meat' | 'bread')) => {
                    const factor = state.membership.orders[product].factor;
                    const basePrice = state.staticData.app.products[product].price;
                    if (factor === 0) {
                        return basePrice;
                    }
                    if (factor < 0) {
                        return basePrice - Math.floor(basePrice * 0.25);
                    }
                    return basePrice + Math.floor(basePrice * 0.25);
                },
            },
        });
    }
    return store;
};