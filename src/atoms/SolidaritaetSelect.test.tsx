import { render, screen } from '@testing-library/react';
import { SolidaritaetSelect } from 'src/atoms/SolidaritaetSelect';
import { describe, expect, test } from 'vitest';

describe('SolidaritaetSelect', () => {
    test('offers solidaritaet options with default selected', () => {
        render(
            <SolidaritaetSelect
                name="solidar"
                value="0"
                onChange={() => undefined}
            />,
        );
        const select = screen.getByRole('combobox');
        expect(screen.getAllByRole('option')).toHaveLength(5);
        expect(screen.getByRole('option', { name: 'normalen' }).selected).toBe(true);
    });
});
