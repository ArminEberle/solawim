import type { ChangeEvent } from 'react';
import { Checkbox } from 'src/atoms/Checkbox';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import type { Abholraum } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';

export type MailRecipientsSelection = {
    abholraeume: Abholraum[];
    products: Product[];
    activeMembers: boolean;
};

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
    const toggleAbholraum = (abholraum: Abholraum, checked: boolean) => {
        const nextAbholraeume = checked
            ? Array.from(new Set([...value.abholraeume, abholraum]))
            : value.abholraeume.filter(item => item !== abholraum);

        onChange({
            ...value,
            abholraeume: nextAbholraeume,
        });
    };

    const toggleProduct = (product: Product, checked: boolean) => {
        const nextProducts = checked
            ? Array.from(new Set([...value.products, product]))
            : value.products.filter(item => item !== product);

        onChange({
            ...value,
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

        onChange({
            ...value,
            activeMembers: event.target.checked,
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
                </div>
            </div>
        </div>
    );
};
