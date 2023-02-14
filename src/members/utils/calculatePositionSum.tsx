import { calculatePositionPrice } from 'src/members/utils/calculatePositionPrice';

export type CalculatePositionSumParams = {
    amount: string | number;
    solidar: string;
    price: number;
};

export function calculatePositionSum({ amount, solidar, price }: CalculatePositionSumParams): number {
    let amountNumber = Number.parseFloat(String(amount));
    if (Number.isNaN(amountNumber)) {
        amountNumber = 0;
    }
    if (amountNumber > 0 && amountNumber < 1) {
        // half parts count as one
        amountNumber = 1;
    }
    const singlePrice = calculatePositionPrice({ solidar, price });

    const positionSum = singlePrice * amountNumber;
    return positionSum;
}