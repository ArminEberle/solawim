import {
    defaultMilchAnteilDistribution,
    isMilchAnteilDistribution,
    MAX_MILCH_ANTEILE,
    MILCH_ANTEIL_PUNKTE,
    MIN_MILCH_ANTEILE,
} from 'src/members/types/MILCH_ANTEIL_PUNKTE';

export type MilchAnteilDistribution = {
    milch: number;
    joghurt: number;
    hartkaese: number;
    extra: number;
};

export const normalizeMilchAnteilDistribution = (
    distribution: MilchAnteilDistribution | undefined | null,
): MilchAnteilDistribution => {
    if (!distribution || !isMilchAnteilDistribution(distribution)) {
        return defaultMilchAnteilDistribution();
    }

    if (validateMilchAnteilDistribution(distribution) === null) {
        return distribution;
    }

    const looksLikeLegacyPointDistribution =
        distribution.milch + distribution.joghurt + distribution.hartkaese + distribution.extra === MAX_MILCH_ANTEILE &&
        distribution.hartkaese % MILCH_ANTEIL_PUNKTE.hartkaese === 0 &&
        distribution.extra % MILCH_ANTEIL_PUNKTE.extra === 0;

    if (looksLikeLegacyPointDistribution) {
        return {
            milch: distribution.milch,
            joghurt: distribution.joghurt,
            hartkaese: distribution.hartkaese / MILCH_ANTEIL_PUNKTE.hartkaese,
            extra: distribution.extra / MILCH_ANTEIL_PUNKTE.extra,
        };
    }

    return defaultMilchAnteilDistribution();
};

export const getMilchAnteilPoints = (distribution: MilchAnteilDistribution): number =>
    distribution.milch * MILCH_ANTEIL_PUNKTE.milch +
    distribution.joghurt * MILCH_ANTEIL_PUNKTE.joghurt +
    distribution.hartkaese * MILCH_ANTEIL_PUNKTE.hartkaese +
    distribution.extra * MILCH_ANTEIL_PUNKTE.extra;

export const getMaxMilchAnteilCount = (field: keyof MilchAnteilDistribution): number =>
    Math.floor(MAX_MILCH_ANTEILE / MILCH_ANTEIL_PUNKTE[field]);

/**
 * Checks that the weighted sum of all parts equals 8 points and all numbers are non-negative integers.
 *
 * @param distribution
 * @returns null for 'valid', error message string for 'invalid'
 */
export const validateMilchAnteilDistribution = (distribution: MilchAnteilDistribution): null | string => {
    for (const field of Object.keys(distribution) as (keyof MilchAnteilDistribution)[]) {
        const value = distribution[field];
        const maxValue = getMaxMilchAnteilCount(field);
        if (!Number.isInteger(value) || value < MIN_MILCH_ANTEILE || value > maxValue) {
            return `${labelForField(field)} Anteil muss Ganzzahl zwischen ${MIN_MILCH_ANTEILE} und ${maxValue} sein.`;
        }
    }

    const totalPoints = getMilchAnteilPoints(distribution);
    if (totalPoints !== MAX_MILCH_ANTEILE) {
        return `Die Summe aller Produkte muss ${MAX_MILCH_ANTEILE} Punkte ergeben. Gerade sind es ${totalPoints}.`;
    }
    return null;
};

const labelForField = (field: keyof MilchAnteilDistribution): string => {
    switch (field) {
        case 'milch':
            return 'Milch';
        case 'joghurt':
            return 'Joghurt';
        case 'hartkaese':
            return 'Hart-/Schnittkäse';
        case 'extra':
            return 'Extra';
    }
};
