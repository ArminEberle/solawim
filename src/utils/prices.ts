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
    2025: {
        fleisch: 105,
        milch: 8,
        brot: 25,
        veggie: 105,
    },
    2026: {
        fleisch: 115,
        milch: 9,
        brot: 28,
        veggie: 111,
    },
};
