import type { Abholraum } from 'src/members/types/MemberData';
import type { Product } from 'src/members/types/Product';

export type ItemSums = {
    /**
     * How many of this item - active and paid are counted here
     */
    amount: number;

    /**
     * What is paid in total for this
     */
    sum: number;

    /**
     * If amount > 0 and member and active, this equals the amount. I.e. how much work units instead of sum.
     * I.e. how many of amount is not paid but worked for.
     */
    activeCount: number;

    /**
     * How many of this are paid for the normal price
     */
    normal: number;

    /**
     * How many of this are paid for the reduced price. Double reduced doubles this number.
     */
    reduziert: number;

    /**
     * How many of this are paid for the normal price. Double increased doubles this number.
     */
    solidar: number;

    /**
     * If amount > 0, how many accounts consume on this
     */
    accountCount: number;

    /**
     * If this is an active membership booking, i.e. for working instead of money
     */
    active?: boolean;

    /**
     * Which product this is about
     */
    product?: Product;

    /**
     * Which abholraum this should be delivered to
     */
    abholraum?: Abholraum;
};

export const emptyItemSums = (): ItemSums => {
    return {
        amount: 0,
        sum: 0,
        normal: 0,
        reduziert: 0,
        solidar: 0,
        accountCount: 0,
        activeCount: 0,
    };
};

/**
 * Adds the toAdd ItemSums to the totalSum ItemSums.
 * Will modify the totalSum ItemSums.
 * @param toAdd
 * @param totalSum the totalSum which will be modified
 * @returns the modified totalSum ItemSums, for convenience
 */
export const addItemSum = (toAdd: ItemSums, totalSum: ItemSums): ItemSums => {
    totalSum.amount += toAdd.amount;
    totalSum.sum += toAdd.sum;
    totalSum.normal += toAdd.normal;
    totalSum.reduziert += toAdd.reduziert;
    totalSum.solidar += toAdd.solidar;
    totalSum.accountCount += toAdd.accountCount;
    totalSum.activeCount += toAdd.activeCount;

    return totalSum;
};
