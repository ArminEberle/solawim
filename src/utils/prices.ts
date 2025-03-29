export type PricesType = Record<
    number,
    {
        fleisch: number;
        milch: number;
        brot: number;
        veggie: number;
    }
>;

export const prices: PricesType = {
    2024: {
        fleisch: 105,
        milch: 2,
        brot: 25,
        veggie: 105,
    },
    2025: {
        fleisch: 105,
        milch: 2,
        brot: 25,
        veggie: 105,
    },
};
