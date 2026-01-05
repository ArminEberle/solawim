import type { Product } from 'src/members/types/Product';
import { ItemSums, emptyItemSums } from './emptyItemSums';

export type SumState = Record<Product, ItemSums> & {
    totalSum: number;
    members: number;
    activeCount: number;
};

export const emptySumState = (): SumState => {
    return {
        totalSum: 0,
        members: 0,
        activeCount: 0,
        fleisch: emptyItemSums(),
        milch: emptyItemSums(),
        brot: emptyItemSums(),
        veggie: emptyItemSums(),
    };
};
