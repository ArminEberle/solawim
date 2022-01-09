require('./style.scss');
import {
    getStatic,
    getMembership,
    setMembership,
} from './api';
import $ from 'jquery';
import { MembershipData } from './structs/MembershipData';

async function test() {
    try {
        const statics = await getStatic();
        $('body')
            .append(`<h2 class="green entry-title">getStatic Test succeeded with:</h2><pre>${JSON.stringify(statics, null, 2)}</pre>`);

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
            },
            pos: Object.keys(statics.pos)[0],
        };

        await setMembership(myMembership);

        const membership = await getMembership();

        if (membership?.orders?.meat?.count === count) {
            $('body')
                .append(`<h2 class="green entry-title">membership Test succeeded with:</h2><pre>${JSON.stringify(membership, null, 2)}</pre>`);
        } else {
            $('body')
                .append(`<h2 class="red entry-title">membership Test not succeeded with:</h2><pre>${JSON.stringify(membership, null, 2)}</pre>`);
        }
    } catch (e) {
        $('body')
            .append(`<h2 class="red entry-title">Error:</h2><pre>${JSON.stringify(e, null, 2)}</pre>`);
    }
}

test();