import type { MailRecipientsSelection } from 'src/members/pages/MailRecipientsSelection';
import { computeMailRecipientUserIdsFromMailRecipientsSelection } from 'src/members/pages/computeMailRecipientUserIdsFromMailRecipientsSelection';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import { Abholraum } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';
import { describe, expect, it } from 'vitest';

const createMember = (overrides: Partial<AllMembersData[number]>): AllMembersData[number] => {
    return {
        id: 'user-1',
        user_email: 'user@example.com',
        user_nicename: 'user',
        membership: {
            member: true,
            active: true,
            abholraum: Abholraum.gertenbach,
            brotMenge: '0',
            brotSolidar: '0',
            fleischMenge: '0',
            fleischSolidar: '0',
            milchMenge: '0',
            milchSolidar: '0',
            veggieMenge: '0',
            veggieSolidar: '0',
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
        },
        ...overrides,
    };
};

describe('computeMailRecipientUserIdsFromMailRecipientsSelection', () => {
    it('returns all members when allMembers flag is set', () => {
        const members: AllMembersData = [
            createMember({ id: '1' }),
            createMember({ id: '2' }),
            createMember({ id: '3', membership: { ...createMember({}).membership!, member: false } }),
        ];

        const selection: MailRecipientsSelection = {
            abholraeume: [],
            products: [],
            activeMembers: false,
            allMembers: true,
        };

        expect(computeMailRecipientUserIdsFromMailRecipientsSelection(members, selection)).toEqual(['1', '2']);
    });

    it('returns empty array when no filters are selected', () => {
        const members: AllMembersData = [createMember({ id: '1' })];

        const selection: MailRecipientsSelection = {
            abholraeume: [],
            products: [],
            activeMembers: false,
            allMembers: false,
        };

        expect(computeMailRecipientUserIdsFromMailRecipientsSelection(members, selection)).toEqual([]);
    });

    it('filters by abholraum, product, and active flags', () => {
        const members: AllMembersData = [
            createMember({ id: '1', membership: { ...createMember({}).membership!, abholraum: Abholraum.gertenbach } }),
            createMember({
                id: '2',
                membership: {
                    ...createMember({}).membership!,
                    abholraum: Abholraum.witzenhausen,
                    veggieMenge: '2',
                    active: false,
                },
            }),
            createMember({
                id: '3',
                membership: {
                    ...createMember({}).membership!,
                    abholraum: Abholraum.hutzelberghof,
                    milchMenge: '1',
                },
            }),
        ];

        const selection: MailRecipientsSelection = {
            abholraeume: [Abholraum.witzenhausen],
            products: [Product.VEGGIE, Product.MILCH],
            activeMembers: true,
            allMembers: false,
        };

        expect(computeMailRecipientUserIdsFromMailRecipientsSelection(members, selection)).toEqual(['1', '2', '3']);
    });
});
