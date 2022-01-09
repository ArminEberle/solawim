require('./style.scss');
import {
    getStatic,
    getMembership,
    setMembership,
} from './api';
import $ from 'jquery';
import { MembershipData } from './structs/MembershipData';
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
            .append(`<h2 class="entry-title green">${name} Test succeeded:</h2>`);
    }
}

async function executeAndFail(name: string, cb: () => string | void | Promise<string | void>) {
    let result: string | void;
    try {
        result = await cb();
    } catch (e) {
        $('body')
            .append(`<h2 class="entry-title green">${name} Test succeeded:</h2>`);
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
}

test();