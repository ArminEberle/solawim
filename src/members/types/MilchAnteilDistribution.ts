export type MilchAnteilDistribution = {
    milch: number;
    joghurt: number;
    hartkaese: number;
    extra: number;
};

export const isMilchAnteilDistribution = (obj: any): obj is MilchAnteilDistribution => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.milch === 'number' &&
        typeof obj.joghurt === 'number' &&
        typeof obj.quark === 'number' &&
        typeof obj.extra === 'number'
    );
};

export const defaultMilchAnteilDistribution: () => MilchAnteilDistribution = () => ({
    milch: 1,
    joghurt: 1,
    hartkaese: 4,
    extra: 2,
});

/**
 * Checks that the sum of all parts equals 8 and all numbers are non-negative integers.
 *
 * @param distribution
 * @returns null for 'valid', error message string for 'invalid'
 */
export const validateMilchAnteilDistribution = (distribution: MilchAnteilDistribution): null | string => {
    const total = distribution.milch + distribution.joghurt + distribution.hartkaese + distribution.extra;
    if (!Number.isInteger(distribution.milch) || distribution.milch < 0 || distribution.milch > 8) {
        return 'Milch Anteil muss Ganzzahl zwischen 0 und 8 sein.';
    }
    if (!Number.isInteger(distribution.joghurt) || distribution.joghurt < 0 || distribution.joghurt > 8) {
        return 'Joghurt Anteil muss Ganzzahl zwischen 0 und 8 sein.';
    }
    if (!Number.isInteger(distribution.hartkaese) || distribution.hartkaese < 0 || distribution.hartkaese > 8) {
        return 'Hart-/Schnittkäse Anteil muss Ganzzahl zwischen 0 und 8 sein.';
    }
    if (!Number.isInteger(distribution.extra) || distribution.extra < 0 || distribution.extra > 8) {
        return 'Extra Anteil muss Ganzzahl zwischen 0 und 8 sein.';
    }
    if (total !== 8) {
        return 'Die Summe aller Anteile muss 8 ergeben. Gerade ist es ' + total + '.';
    }
    return null;
};
export const MIN_MILCH_ANTEILE = 0;
export const MAX_MILCH_ANTEILE = 8;
