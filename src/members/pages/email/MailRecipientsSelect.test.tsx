import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MailRecipientsSelect } from 'src/members/pages/email/MailRecipientsSelect';
import type { MailRecipientsSelection } from 'src/members/types/MailRecipientsSelection';
import { Product } from 'src/members/types/Product';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { afterEach, describe, expect, it } from 'vitest';

const INITIAL_SELECTION: MailRecipientsSelection = {
    abholraeume: [],
    products: [],
    activeMembers: false,
    allMembers: false,
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

        const activeCheckbox = screen.getByText(text => text.startsWith('Aktive Mitglieder'));

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

    it('turns off all members mode when other filters are chosen', async () => {
        render(<StatefulRecipientsSelect />);

        const allMembersCheckbox = screen.getByText('Alle Mitglieder');
        fireEvent.click(allMembersCheckbox);

        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                abholraeume: [],
                products: [],
                activeMembers: false,
                allMembers: true,
            });
        });

        const firstAbholraum = abholraumOptions[0];
        const abholraumLabel = firstAbholraum.display ?? firstAbholraum.value;
        fireEvent.click(screen.getByText(abholraumLabel));

        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                ...INITIAL_SELECTION,
                abholraeume: [firstAbholraum.value],
            });
        });

        fireEvent.click(allMembersCheckbox);
        await waitFor(() => {
            expect(parseSelectionState()).toEqual({
                abholraeume: [],
                products: [],
                activeMembers: false,
                allMembers: true,
            });
        });

        fireEvent.click(allMembersCheckbox);
        await waitFor(() => {
            expect(parseSelectionState()).toEqual(INITIAL_SELECTION);
        });
    });
});
