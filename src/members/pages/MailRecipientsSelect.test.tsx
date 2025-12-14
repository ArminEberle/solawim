import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useState } from 'react';
import { MailRecipientsSelect, type MailRecipientsSelection } from 'src/members/pages/MailRecipientsSelect';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { Product } from 'src/members/types/Product';

const INITIAL_SELECTION: MailRecipientsSelection = {
    abholraeume: [],
    products: [],
    activeMembers: false,
};

const StatefulRecipientsSelect = ({ disabled = false }: { disabled?: boolean }) => {
    const [selection, setSelection] = useState<MailRecipientsSelection>(INITIAL_SELECTION);

    return (
        <>
            <MailRecipientsSelect
                value={selection}
                onChange={setSelection}
                disabled={disabled}
            />
            <pre data-testid="selection-state">{JSON.stringify(selection)}</pre>
        </>
    );
};

const parseSelectionState = () => {
    const nodes = screen.getAllByTestId('selection-state');
    const latest = nodes[nodes.length - 1];
    const content = latest.textContent ?? '';
    return JSON.parse(content) as MailRecipientsSelection;
};

afterEach(() => {
    cleanup();
});

describe('MailRecipientsSelect', () => {
    it('updates selection when toggling abholraum checkboxes', async () => {
        render(<StatefulRecipientsSelect />);

        const firstAbholraum = abholraumOptions[0];
        const abholraumLabel = firstAbholraum.display ?? firstAbholraum.value;

        fireEvent.click(screen.getByText(abholraumLabel));

        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                ...INITIAL_SELECTION,
                abholraeume: [firstAbholraum.value],
            });
        });

        fireEvent.click(screen.getByText(abholraumLabel));

        await waitFor(() => {
            expect(parseSelectionState()).toEqual(INITIAL_SELECTION);
        });
    });

    it('updates selection when toggling product checkboxes', async () => {
        render(<StatefulRecipientsSelect />);

        const gemueseLabel = screen.getAllByText('Gemüse')[0];
        fireEvent.click(gemueseLabel);

        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                ...INITIAL_SELECTION,
                products: [Product.VEGGIE],
            });
        });

        fireEvent.click(gemueseLabel);

        await waitFor(() => {
            expect(parseSelectionState()).toEqual(INITIAL_SELECTION);
        });
    });

    it('does not change selection when disabled', () => {
        render(<StatefulRecipientsSelect disabled={true} />);

        const gemueseLabel = screen.getAllByText('Gemüse')[0];
        fireEvent.click(gemueseLabel);

        expect(parseSelectionState()).toEqual(INITIAL_SELECTION);
    });

    it('updates selection when toggling active members checkbox', async () => {
        render(<StatefulRecipientsSelect />);

        const activeCheckbox = screen.getByText('Aktive Mitglieder');

        fireEvent.click(activeCheckbox);
        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                ...INITIAL_SELECTION,
                activeMembers: true,
            });
        });

        fireEvent.click(activeCheckbox);
        await waitFor(() => {
            expect(parseSelectionState()).toEqual(INITIAL_SELECTION);
        });
    });
});
