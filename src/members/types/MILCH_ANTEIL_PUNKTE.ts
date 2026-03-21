import type { MilchAnteilDistribution } from 'src/members/types/MilchAnteilDistribution';

export const MILCH_ANTEIL_PUNKTE: Record<keyof MilchAnteilDistribution, number> = {
    milch: 1,
    joghurt: 1,
    hartkaese: 4,
    extra: 2,
};
export const MIN_MILCH_ANTEILE = 0;
export const MAX_MILCH_ANTEILE = 8;
export const defaultMilchAnteilDistribution: () => MilchAnteilDistribution = () => ({
    milch: 1,
    joghurt: 1,
    hartkaese: 1,
    extra: 1,
});
export const isMilchAnteilDistribution = (obj: any): obj is MilchAnteilDistribution => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.milch === 'number' &&
        typeof obj.joghurt === 'number' &&
        typeof obj.hartkaese === 'number' &&
        typeof obj.extra === 'number'
    );
};
