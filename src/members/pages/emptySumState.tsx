import { emptyItemSums, ItemSums } from "./emptyItemSums";

export type SumState = {
    fleisch: ItemSums;
    brot: ItemSums;
    veggie: ItemSums;
    totalSum: number;
    members: number;
};

export function emptySumState(): SumState {
    return {
        fleisch: emptyItemSums(),
        brot: emptyItemSums(),
        veggie: emptyItemSums(),
        totalSum: 0,
        members: 0,
    };
}
