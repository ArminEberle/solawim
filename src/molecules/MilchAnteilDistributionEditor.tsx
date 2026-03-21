import { Horizontal } from 'src/layout/Horizontal';
import { MemberSelfManagementPageMilchAnteilHint } from 'src/members/pages/member/MemberSelfManagementPageText';
import {
    getMaxMilchAnteilCount,
    getMilchAnteilPoints,
    normalizeMilchAnteilDistribution,
    validateMilchAnteilDistribution,
    type MilchAnteilDistribution,
} from 'src/members/types/MilchAnteilDistribution';
import { MAX_MILCH_ANTEILE } from 'src/members/types/MILCH_ANTEIL_PUNKTE';
import { MIN_MILCH_ANTEILE } from 'src/members/types/MILCH_ANTEIL_PUNKTE';
import { MILCH_ANTEIL_PUNKTE } from 'src/members/types/MILCH_ANTEIL_PUNKTE';
import { useEffect } from 'react';
import { Noop } from 'src/utils/Noop';

const milchAnteileSequence: { key: keyof MilchAnteilDistribution; label: string }[] = [
    { key: 'milch', label: 'Milch' },
    { key: 'joghurt', label: 'Joghurt' },
    { key: 'hartkaese', label: 'Hart-/Schnittkäse' },
    { key: 'extra', label: 'Extra' },
];

type MilchAnteilDistributionEditorProps = {
    showInfo?: boolean;
    disabled?: boolean;
    value: MilchAnteilDistribution;
    onChange?: (newValue: MilchAnteilDistribution) => void;
};

/**
 * Controlled component to edit MilchAnteilDistribution values.
 * If the value is invalid, it will not call onChange.
 * Instead, it should display validation errors internally.
 *
 */
export const MilchAnteilDistributionEditor = ({
    showInfo,
    value,
    onChange = Noop,
    disabled,
}: MilchAnteilDistributionEditorProps) => {
    const normalizedValue = normalizeMilchAnteilDistribution(value);
    const currentError = validateMilchAnteilDistribution(normalizedValue);
    const usedPoints = getMilchAnteilPoints(normalizedValue);

    useEffect(() => {
        if (
            value.milch !== normalizedValue.milch ||
            value.joghurt !== normalizedValue.joghurt ||
            value.hartkaese !== normalizedValue.hartkaese ||
            value.extra !== normalizedValue.extra
        ) {
            onChange(normalizedValue);
        }
    }, [normalizedValue, onChange, value.extra, value.hartkaese, value.joghurt, value.milch]);

    const handleChange = (field: keyof MilchAnteilDistribution, newPartValue: number) => {
        const clampedValue = Math.max(MIN_MILCH_ANTEILE, Math.min(getMaxMilchAnteilCount(field), newPartValue));
        const newValue = rebalanceMilchAnteilDistribution({
            currentValue: normalizedValue,
            changedField: field,
            changedFieldValue: clampedValue,
        });

        if (newValue) {
            onChange(newValue);
        }
    };

    return (
        <div>
            <b>Milch-Anteils-Verteilung</b>
            <div style={{ margin: '0.25rem 0 0.5rem 0' }}>
                <small>
                    Verwendete Punkte: {usedPoints} / {MAX_MILCH_ANTEILE}
                </small>
            </div>
            {showInfo && <MemberSelfManagementPageMilchAnteilHint />}

            <Horizontal className="mb-4">
                {milchAnteileSequence.map(({ key, label }) => (
                    <div key={key}>
                        <label
                            className="block font-medium mb-1"
                            htmlFor={`manteil_${key}`}
                            style={{ marginRight: '0.5rem' }}
                        >
                            {label} Anteil ({MILCH_ANTEIL_PUNKTE[key]} Punkt{MILCH_ANTEIL_PUNKTE[key] > 1 ? 'e' : ''})
                        </label>
                        <input
                            type="number"
                            id={`manteil_${key}`}
                            min={MIN_MILCH_ANTEILE}
                            max={getMaxMilchAnteilCount(key)}
                            step={1}
                            value={normalizedValue[key]}
                            onChange={e => handleChange(key, parseInt(e.target.value, 10) || 0)}
                            className="form-control"
                            disabled={disabled ?? false}
                        />
                        <small>
                            Aktuell: {normalizedValue[key] * MILCH_ANTEIL_PUNKTE[key]} / {MAX_MILCH_ANTEILE} Punkte
                        </small>
                    </div>
                ))}
            </Horizontal>
            {currentError && <p className="text-red-600 mt-2">{currentError}</p>}
        </div>
    );
};

const rebalanceMilchAnteilDistribution = ({
    currentValue,
    changedField,
    changedFieldValue,
}: {
    currentValue: MilchAnteilDistribution;
    changedField: keyof MilchAnteilDistribution;
    changedFieldValue: number;
}): MilchAnteilDistribution | null => {
    const targetPointsForOtherFields = MAX_MILCH_ANTEILE - changedFieldValue * MILCH_ANTEIL_PUNKTE[changedField];
    if (targetPointsForOtherFields < 0) {
        return null;
    }

    const otherFields = milchAnteileSequence.map(item => item.key).filter(field => field !== changedField);
    const candidates: MilchAnteilDistribution[] = [];

    for (let firstValue = MIN_MILCH_ANTEILE; firstValue <= getMaxMilchAnteilCount(otherFields[0]); firstValue += 1) {
        for (
            let secondValue = MIN_MILCH_ANTEILE;
            secondValue <= getMaxMilchAnteilCount(otherFields[1]);
            secondValue += 1
        ) {
            for (
                let thirdValue = MIN_MILCH_ANTEILE;
                thirdValue <= getMaxMilchAnteilCount(otherFields[2]);
                thirdValue += 1
            ) {
                const candidate = {
                    ...currentValue,
                    [changedField]: changedFieldValue,
                    [otherFields[0]]: firstValue,
                    [otherFields[1]]: secondValue,
                    [otherFields[2]]: thirdValue,
                };

                const candidatePointsWithoutChangedField =
                    candidate[otherFields[0]] * MILCH_ANTEIL_PUNKTE[otherFields[0]] +
                    candidate[otherFields[1]] * MILCH_ANTEIL_PUNKTE[otherFields[1]] +
                    candidate[otherFields[2]] * MILCH_ANTEIL_PUNKTE[otherFields[2]];

                if (candidatePointsWithoutChangedField === targetPointsForOtherFields) {
                    candidates.push(candidate);
                }
            }
        }
    }

    if (candidates.length === 0) {
        return null;
    }

    candidates.sort(
        (candidateA, candidateB) => scoreCandidate(candidateA, currentValue) - scoreCandidate(candidateB, currentValue),
    );
    return candidates[0];
};

const scoreCandidate = (candidate: MilchAnteilDistribution, currentValue: MilchAnteilDistribution): number => {
    return milchAnteileSequence.reduce((score, { key }) => score + Math.abs(candidate[key] - currentValue[key]), 0);
};
