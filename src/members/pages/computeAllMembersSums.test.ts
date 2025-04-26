import { computeAllMembersSums } from 'src/members/pages/computeAllMembersSums';
import { emptyItemSums } from 'src/members/pages/emptyItemSums';
import type { OverallSumState } from 'src/members/pages/emptyOverallSumState';
import { emptySumState, type SumState } from 'src/members/pages/emptySumState';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import { Abholraum, type MemberData, type Solidar } from 'src/members/types/MemberData';
import { ZeroTo30 } from 'src/members/types/MemberData';

const dummyMemberData: MemberData = {
    active: true,
    member: true,
    firstname: 'Max',
    lastname: 'Mustermann',
    street: 'Musterstraße 1',
    plz: '12345',
    city: 'Musterstadt',
    tel: '0123456789',
    useSepa: true,
    iban: 'DE12345678901234567890',
    bic: 'DEUTDEDBFRA',
    bank: 'Deutsche Bank',
    accountowner: 'Max Mustermann',
    accountownerStreet: 'Musterstraße 1',
    accountownerPlz: '12345',
    accountownerCity: 'Musterstadt',
    mandateDate: '2023-01-01',

    abholraum: Abholraum.hutzelberghof,
    fleischMenge: '0' as ZeroTo30,
    fleischSolidar: '0' as Solidar,
    brotMenge: '0' as ZeroTo30,
    brotSolidar: '0' as Solidar,
    veggieMenge: '0' as ZeroTo30,
    veggieSolidar: '0' as Solidar,
    milchMenge: '0' as ZeroTo30,
    milchSolidar: '0' as Solidar,
};

describe('computeAllMembersSums', () => {
    it('should compute sums correctly', () => {
        const allMembers: AllMembersData = [
            {
                id: '3',
                user_email: 'nomember',
                user_nicename: 'nomember',

                membership: {
                    ...dummyMemberData,
                    member: false,
                    abholraum: Abholraum.hutzelberghof,
                    fleischMenge: '3' as ZeroTo30,
                },
            },
            {
                id: '1',
                user_email: 'activemember',
                user_nicename: 'activemember',
                membership: {
                    ...dummyMemberData,
                    abholraum: Abholraum.gertenbach,
                    fleischMenge: '2' as ZeroTo30,
                    brotMenge: '1' as ZeroTo30,
                },
            },
            {
                id: '2',
                user_email: 'asdf2',
                user_nicename: 'user2',
                membership: {
                    ...dummyMemberData,
                    abholraum: Abholraum.hutzelberghof,
                    active: false,
                    fleischMenge: '3' as ZeroTo30,
                    brotMenge: '1' as ZeroTo30,
                },
            },
            {
                id: '4',
                user_email: 'witzenhausenmensch',
                user_nicename: 'witzenhausenmensch',

                membership: {
                    ...dummyMemberData,
                    active: false,
                    abholraum: Abholraum.witzenhausen,
                    fleischMenge: '1' as ZeroTo30,
                    brotMenge: '1' as ZeroTo30,
                    veggieMenge: '1' as ZeroTo30,
                    veggieSolidar: '-1' as Solidar,
                    milchMenge: '1' as ZeroTo30,
                },
            },
        ];

        const season = 2025;
        const result = computeAllMembersSums(allMembers, season);

        expect(result.total).toEqual({
            totalSum: 566,
            members: 3,
            activeCount: 3,
            fleisch: {
                amount: 6,
                sum: 420,
                normal: 4,
                reduziert: 0,
                solidar: 0,
                accountCount: 3,
                activeCount: 2,
            },
            milch: {
                amount: 1,
                sum: 8,
                normal: 1,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            brot: {
                amount: 3,
                sum: 50,
                normal: 2,
                reduziert: 0,
                solidar: 0,
                accountCount: 3,
                activeCount: 1,
            },
            veggie: {
                amount: 1,
                sum: 88,
                normal: 0,
                reduziert: 1,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
        } satisfies SumState);

        expect(result.hutzelberghof).toEqual({
            totalSum: 340,
            members: 1,
            activeCount: 0,
            fleisch: {
                amount: 3,
                sum: 315,
                normal: 3,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            brot: {
                amount: 1,
                sum: 25,
                normal: 1,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            milch: emptyItemSums(),
            veggie: emptyItemSums(),
        } satisfies SumState);

        expect(result.gertenbach).toEqual({
            totalSum: 0,
            members: 1,
            activeCount: 3,
            fleisch: {
                amount: 2,
                sum: 0,
                normal: 0,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 2,
            },
            brot: {
                amount: 1,
                sum: 0,
                normal: 0,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 1,
            },
            milch: emptyItemSums(),
            veggie: emptyItemSums(),
        } satisfies SumState);

        expect(result.witzenhausen).toEqual({
            totalSum: 226,
            members: 1,
            activeCount: 0,
            fleisch: {
                amount: 1,
                sum: 105,
                normal: 1,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            brot: {
                amount: 1,
                sum: 25,
                normal: 1,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            veggie: {
                amount: 1,
                sum: 88,
                normal: 0,
                reduziert: 1,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
            milch: {
                amount: 1,
                sum: 8,
                normal: 1,
                reduziert: 0,
                solidar: 0,
                accountCount: 1,
                activeCount: 0,
            },
        } satisfies SumState);
    });
});
