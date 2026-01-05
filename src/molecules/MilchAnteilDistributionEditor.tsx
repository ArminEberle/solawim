import { Horizontal } from 'src/layout/Horizontal';
import { MemberSelfManagementPageMilchAnteilHint } from 'src/members/pages/member/MemberSelfManagementPageText';
import {
    MAX_MILCH_ANTEILE,
    MIN_MILCH_ANTEILE,
    validateMilchAnteilDistribution,
    type MilchAnteilDistribution,
} from 'src/members/types/MilchAnteilDistribution';
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
    const currentError = validateMilchAnteilDistribution(value);

    const handleChange = (field: keyof MilchAnteilDistribution, newPartValue: number) => {
        newPartValue = Math.max(MIN_MILCH_ANTEILE, Math.min(MAX_MILCH_ANTEILE, newPartValue));
        const valueDifference = newPartValue - value[field];
        console.log('Changed field', field, 'from', value[field], 'to', newPartValue, 'difference', valueDifference);
        const newValue = { ...value, [field]: newPartValue };
        // adjust other fields to keep the total sum 8
        const myIndex = milchAnteileSequence.findIndex(item => item.key === field);
        let otherFields = milchAnteileSequence
            .map(item => item.key)
            .filter((f, index) => f !== field && index > myIndex);
        otherFields = otherFields.concat(
            milchAnteileSequence.map(item => item.key).filter((f, index) => index <= myIndex),
        );

        let remainingDifference = -valueDifference;
        for (const otherField of otherFields) {
            if (remainingDifference === 0) break;
            const currentOtherValue = newValue[otherField];
            let newOtherValue = currentOtherValue + remainingDifference;
            if (newOtherValue < MIN_MILCH_ANTEILE) {
                remainingDifference = newOtherValue;
                newOtherValue = MIN_MILCH_ANTEILE;
            } else if (newOtherValue > MAX_MILCH_ANTEILE) {
                remainingDifference = newOtherValue - MAX_MILCH_ANTEILE;
                newOtherValue = MAX_MILCH_ANTEILE;
            } else {
                remainingDifference = 0;
            }
            newValue[otherField] = newOtherValue;
        }
        const error = validateMilchAnteilDistribution(newValue);
        if (error === null) {
            onChange(newValue);
        }
    };

    return (
        <div>
            <b>Milch-Anteils-Verteilung</b>
            {showInfo && <MemberSelfManagementPageMilchAnteilHint />}

            <Horizontal className="mb-4">
                {milchAnteileSequence.map(({ key, label }) => (
                    <div key={key}>
                        <label
                            className="block font-medium mb-1"
                            htmlFor={`manteil_${key}`}
                            style={{ marginRight: '0.5rem' }}
                        >
                            {label} Anteil
                        </label>
                        <input
                            type="number"
                            id={`manteil_${key}`}
                            min={MIN_MILCH_ANTEILE}
                            max={MAX_MILCH_ANTEILE}
                            step={1}
                            value={value[key]}
                            onChange={e => handleChange(key, parseInt(e.target.value, 10) || 0)}
                            className="form-control"
                            disabled={disabled ?? false}
                        />
                    </div>
                ))}
            </Horizontal>
            {currentError && <p className="text-red-600 mt-2">{currentError}</p>}
        </div>
    );
};
