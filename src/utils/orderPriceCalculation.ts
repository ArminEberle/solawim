export const getOrderPrice = (basePrice: number, factor: number): number => {
    if (factor === 0) {
        return basePrice;
    }
    if (factor < 0) {
        return (
            basePrice
      - Math.floor(basePrice * 0.25)
        );
    }
    return (
        basePrice
    + Math.floor(basePrice * 0.25)
    );
};

export const getFactorName = (factor: number): string => {
    if (factor < 0) {
        return 'reduziert';
    }
    if (factor === 0) {
        return 'normal';
    }
    return 'solidarisch';
};