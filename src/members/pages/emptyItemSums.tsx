
export type ItemSums = {
    count: number;
    sum: number;
    normal: number;
    reduziert: number;
    solidar: number;
    accountCount: number;
};

export function emptyItemSums(): ItemSums {
    return {
        count: 0,
        sum: 0,
        normal: 0,
        reduziert: 0,
        solidar: 0,
        accountCount: 0,
    };
}
