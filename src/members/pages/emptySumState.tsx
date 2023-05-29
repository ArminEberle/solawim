import { emptyItemSums, ItemSums } from "./emptyItemSums";

export type SumState = {
    fleisch: ItemSums;
    milch: ItemSums;
    brot: ItemSums;
    veggie: ItemSums;
    totalSum: number;
    members: number;
};

export function emptySumState(): SumState {
    return {
        fleisch: emptyItemSums(),
        milch: emptyItemSums(),
        brot: emptyItemSums(),
        veggie: emptyItemSums(),
        totalSum: 0,
        members: 0,
    };
}
