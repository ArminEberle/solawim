require('./style.scss');
import {
    getStatic,
    getMembership,
    setMembership,
    setPersonData,
    getPersonData,
} from './api';
import $ from 'jquery';
import { MembershipData } from './structs/MembershipData';
import { PersonData } from './structs/PersonData';
import { StaticData } from './structs/StaticData';
import deepEqual from 'deep-equal';
import clone from 'clone-deep';

async function executeAndReport(name: string, cb: () => string | void | Promise<string | void>) {
    let result: string | void;
    try {
        result = await cb();
    } catch (e) {
        result = String(e);
    }
    if (result) {
        $('body')
            .append(`<h2 class="entry-title">${name} Test failed with:</h2><pre>${result}</pre>`);
    } else {
        $('body')
            .append(`<p class="entry-title green">${name} Test succeeded</p>`);
    }
}

async function executeAndFail(name: string, cb: () => string | void | Promise<string | void>) {
    let result: string | void;
    try {
        result = await cb();
    } catch (e) {
        $('body')
            .append(`<p class="entry-title green">${name} Test succeeded</p>`);
        return;
    }
    $('body')
        .append(`<h2 class="entry-title">${name} Test failed as id did not fail:</h2><pre>${result}</pre>`);
}

async function test() {
    let staticData: StaticData = {} as any;

    await executeAndReport('getStatic', async() => {
        staticData = await getStatic();
    });
    const count = Math.floor(Math.random() * 10);

    const myMembership: MembershipData = {
        applied: true,
        signed: false,
        lastModified: 'now',
        orders: {
            meat: {
                count: count,
                factor: 1,
            },
            bread: {
                count: 3,
                factor: 1,
            },
        },
        pos: Object.keys(staticData.app.pos)[0],
    };

    await executeAndReport('setMembership', async() => {
        const setResult = await setMembership(myMembership);
        const membership = await getMembership();
        if (membership?.orders?.meat?.count !== count) {
            return 'We did not meet the expected count of meat order';
        }
        if (!deepEqual(setResult, membership)) {
            return 'the set result and the get result are not the same';
        }
    });

    let badRequest = clone(myMembership);
    badRequest.orders.trash = {
        count: 1,
        factor: 1,
    };
    delete badRequest.orders.meat;
    await executeAndFail('bad ingredient', () => setMembership(badRequest));

    badRequest = clone(myMembership);
    badRequest.orders.meat.count = 100;
    await executeAndFail('count 100', () => setMembership(badRequest));

    badRequest = clone(myMembership);
    badRequest.orders.meat.count = -100;
    await executeAndFail('count -100', () => setMembership(badRequest));

    badRequest = clone(myMembership);
    badRequest.orders.meat.factor = 2;
    await executeAndFail('factor 2', () => setMembership(badRequest));

    badRequest = clone(myMembership);
    (badRequest as any).applied = 'armin';
    await executeAndFail('bad applied', () => setMembership(badRequest));

    badRequest = clone(myMembership);
    (badRequest as any).signed = 'armin';
    await executeAndFail('bad signed', () => setMembership(badRequest));

    const myPersonal: PersonData = {
        firstname: 'a',
        lastname: 'a',
        zip: 12345,
        city: 'a',
        phone: 'a',
        street: 'a',
    };

    await executeAndReport('setPersonal', async() => {
        await setPersonData(myPersonal);
        const personData = await getPersonData();
        if (!deepEqual(myPersonal, personData)) {
            return 'Did not store';
        }
    });

    let badPersonal: Partial<PersonData> = clone(myPersonal);
    delete badPersonal.city;
    await executeAndFail('personal missing attribute', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    delete badPersonal.firstname;
    await executeAndFail('personal missing attribute', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    delete badPersonal.lastname;
    await executeAndFail('personal missing attribute', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    delete badPersonal.street;
    await executeAndFail('personal missing attribute', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    delete badPersonal.city;
    await executeAndFail('personal missing attribute', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    badPersonal.zip = 10;
    await executeAndFail('personal zip too small', () => setPersonData(badPersonal as any));

    badPersonal = clone(myPersonal);
    (badPersonal as any).zip = 'asdfsadf';
    await executeAndFail('personal zip string', () => setPersonData(badPersonal as any));
}

test();