import type { ChangeEvent } from 'react';
import { Checkbox } from 'src/atoms/Checkbox';
import type { MailRecipientsSelection } from 'src/members/pages/MailRecipientsSelection';
import type { Abholraum } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';
import { abholraumOptions } from 'src/utils/abholraumOptions';

const PRODUCT_OPTIONS: { value: Product; label: string }[] = [
    {
        value: Product.VEGGIE,
        label: 'Gemüse',
    },
    {
        value: Product.FLEISCH,
        label: 'Fleisch und Käse',
    },
    {
        value: Product.MILCH,
        label: 'Rohmilch',
    },
    {
        value: Product.BROT,
        label: 'Brot',
    },
];

type MailRecipientsSelectProps = {
    value: MailRecipientsSelection;
    onChange: (value: MailRecipientsSelection) => void;
    disabled?: boolean;
};

export const MailRecipientsSelect = ({ value, onChange, disabled = false }: MailRecipientsSelectProps) => {
    const getBaseSelection = (): MailRecipientsSelection => {
        if (value.allMembers) {
            return { ...value, allMembers: false };
        }

        return { ...value };
    };

    const toggleAbholraum = (abholraum: Abholraum, checked: boolean) => {
        const baseSelection = getBaseSelection();
        const nextAbholraeume = checked
            ? Array.from(new Set([...baseSelection.abholraeume, abholraum]))
            : baseSelection.abholraeume.filter(item => item !== abholraum);

        onChange({
            ...baseSelection,
            abholraeume: nextAbholraeume,
        });
    };

    const toggleProduct = (product: Product, checked: boolean) => {
        const baseSelection = getBaseSelection();
        const nextProducts = checked
            ? Array.from(new Set([...baseSelection.products, product]))
            : baseSelection.products.filter(item => item !== product);

        onChange({
            ...baseSelection,
            products: nextProducts,
        });
    };

    const handleAbholraumChange = (abholraum: Abholraum) => (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        toggleAbholraum(abholraum, event.target.checked);
    };

    const handleProductChange = (product: Product) => (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            event.preventDefault();
            return;
        }
        toggleProduct(product, event.target.checked);
    };

    const handleActiveMembersChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            event.preventDefault();
            return;
        }

        const baseSelection = getBaseSelection();

        onChange({
            ...baseSelection,
            activeMembers: event.target.checked,
        });
    };

    const handleAllMembersChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
            event.preventDefault();
            return;
        }

        const nextAllMembers = event.target.checked;

        onChange({
            abholraeume: nextAllMembers ? [] : value.abholraeume,
            products: nextAllMembers ? [] : value.products,
            activeMembers: nextAllMembers ? false : value.activeMembers,
            allMembers: nextAllMembers,
        });
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
                <strong>Abholräume</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    {abholraumOptions.map(option => (
                        <Checkbox
                            key={option.value}
                            value={value.abholraeume.includes(option.value)}
                            onChange={handleAbholraumChange(option.value)}
                            disabled={disabled}
                        >
                            {option.display ?? option.value}
                        </Checkbox>
                    ))}
                </div>
            </div>
            <div>
                <strong>Produkte</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    {PRODUCT_OPTIONS.map(option => (
                        <Checkbox
                            key={option.value}
                            value={value.products.includes(option.value)}
                            onChange={handleProductChange(option.value)}
                            disabled={disabled}
                        >
                            {option.label}
                        </Checkbox>
                    ))}
                </div>
            </div>
            <div>
                <strong>Status</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <Checkbox
                        value={value.activeMembers}
                        onChange={handleActiveMembersChange}
                        disabled={disabled}
                    >
                        Aktive Mitglieder (Arbeit gegen Anteile)
                    </Checkbox>
                    <Checkbox
                        value={value.allMembers}
                        onChange={handleAllMembersChange}
                        disabled={disabled}
                    >
                        Alle Mitglieder
                    </Checkbox>
                </div>
            </div>
        </div>
    );
};
