export type CalculatePositionPriceParams = {
    solidar: string;
    price: number;
};

export function calculatePositionPrice({ solidar, price }: CalculatePositionPriceParams): number {
    let solidarAmount = 0;
    switch (solidar) {
        case '-2': solidarAmount = -Math.floor(price / 3); break;
        case '-1': solidarAmount = -Math.floor(price / 6); break;
        case '1': solidarAmount = Math.floor(price / 6); break;
        case '2': solidarAmount = Math.floor(price / 3); break;
        default: break;
    }

    return price + solidarAmount;
}