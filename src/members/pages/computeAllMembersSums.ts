import { AllMembersData } from 'src/members/types/AllMembersData';
import type { MemberData } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';
import { addItemSum, emptyItemSums, type ItemSums } from 'src/members/pages/emptyItemSums';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { has } from 'src/utils/has';
import { prices } from 'src/utils/prices';
import { emptyOverallSumState, type OverallSumState } from './emptyOverallSumState';

type AmountField = 'brotMenge' | 'fleischMenge' | 'milchMenge' | 'veggieMenge';
type SolidarField = 'brotSolidar' | 'fleischSolidar' | 'milchSolidar' | 'veggieSolidar';

const PRODUCT_FIELD_MAP: Record<Product, { amount: AmountField; solidar: SolidarField }> = {
    [Product.BROT]: {
        amount: 'brotMenge',
        solidar: 'brotSolidar',
    },
    [Product.FLEISCH]: {
        amount: 'fleischMenge',
        solidar: 'fleischSolidar',
    },
    [Product.MILCH]: {
        amount: 'milchMenge',
        solidar: 'milchSolidar',
    },
    [Product.VEGGIE]: {
        amount: 'veggieMenge',
        solidar: 'veggieSolidar',
    },
};

export const computeAllMembersSums = (allMembers: AllMembersData, season: number): OverallSumState => {
    const total = emptyOverallSumState();
    for (const member of allMembers) {
        const membership = member.membership;
        if (!membership?.member) {
            continue;
        }
        const abholraum = membership.abholraum;
        if (!has(abholraum)) {
            console.log('Kein Abholraum festgelegt für Mitglied, Mitgleid wird nicht gezählt: ' + member.user_nicename);
            continue;
        }

        let consuming = false;
        for (const product of Object.values(Product)) {
            const memberProductSum = computeMemberProductSum(product, membership, season);
            if (memberProductSum.amount === 0) {
                continue;
            }
            const abholraumTotal = total[memberProductSum.abholraum!];
            if (!consuming) {
                abholraumTotal.members++;
                consuming = true;
            }
            total.total.totalSum += memberProductSum.sum;
            total.total.activeCount += memberProductSum.activeCount;

            // add this member product sums to the overall total
            addItemSum(memberProductSum, total.total[memberProductSum.product!]);

            // add this member product sums to the abholraum total
            addItemSum(memberProductSum, abholraumTotal[memberProductSum.product!]);
            abholraumTotal.totalSum += memberProductSum.sum;
            abholraumTotal.activeCount += memberProductSum.activeCount;
        }
        if (consuming) {
            total.total.members++;
        }
    }
    return total;
};

const computeMemberProductSum = (product: Product, membership: MemberData, season: number): ItemSums => {
    const result = emptyItemSums();
    result.abholraum = membership.abholraum!;
    result.product = product;
    result.active = membership.active;

    const { amount: amountField, solidar: solidarField } = PRODUCT_FIELD_MAP[product];
    const rawAmount = membership[amountField] ?? '0';
    const articleAmount = Number.parseInt(String(rawAmount)) || 0;
    if (articleAmount === 0) {
        return result;
    }
    result.amount = articleAmount;
    result.accountCount = 1;

    if (result.active) {
        // result.normal = articleAmount;
        result.activeCount += result.amount;
        return result;
    }

    const rawSolidar = membership[solidarField] ?? '0';
    const articleSolidar = String(rawSolidar);
    let articleSolidarNumber = Number.parseInt(articleSolidar);
    if (Number.isNaN(articleSolidarNumber)) {
        articleSolidarNumber = 0;
    }

    if (articleSolidarNumber === 0) {
        result.normal = articleAmount;
    } else if (articleSolidarNumber === -1) {
        result.reduziert = articleAmount;
    } else if (articleSolidarNumber === -2) {
        result.reduziert = articleAmount * 2;
    } else if (articleSolidarNumber === 1) {
        result.solidar = articleAmount;
    } else if (articleSolidarNumber === 2) {
        result.solidar = articleAmount * 2;
    }

    const productSum = calculatePositionSum({
        solidar: articleSolidar,
        price: result.active ? 0 : prices[season][product],
        amount: articleAmount,
    });
    result.sum = productSum;

    return result;
};
