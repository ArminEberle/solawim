import type { MailRecipientsSelection } from 'src/members/pages/MailRecipientsSelection';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { MemberData } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';

const PRODUCT_AMOUNT_FIELD_MAP: Record<Product, keyof MemberData> = {
    [Product.BROT]: 'brotMenge',
    [Product.FLEISCH]: 'fleischMenge',
    [Product.MILCH]: 'milchMenge',
    [Product.VEGGIE]: 'veggieMenge',
};

export const computeMailRecipientUserIdsFromMailRecipientsSelection = (
    members: AllMembersData,
    selection: MailRecipientsSelection,
): string[] => {
    if (selection.allMembers) {
        return members.filter(member => member.membership?.member).map(member => member.id);
    }

    if (selection.abholraeume.length === 0 && selection.products.length === 0 && !selection.activeMembers) {
        return [];
    }

    return members
        .filter(member => {
            const membership = member.membership;
            if (!membership?.member) {
                return false;
            }

            const matchesAbholraum =
                selection.abholraeume.length > 0 &&
                membership.abholraum !== undefined &&
                selection.abholraeume.includes(membership.abholraum);

            const matchesActive = selection.activeMembers && membership.active === true;

            const matchesProduct = selection.products.some(product => {
                const fieldName = PRODUCT_AMOUNT_FIELD_MAP[product];
                const amount = membership[fieldName];
                if (typeof amount === 'string') {
                    return amount !== '0';
                }
                if (typeof amount === 'number') {
                    return amount > 0;
                }
                return amount !== undefined && amount !== null;
            });

            return matchesActive || matchesAbholraum || matchesProduct;
        })
        .map(member => member.id);
};
