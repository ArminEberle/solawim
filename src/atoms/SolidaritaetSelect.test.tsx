import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SolidaritaetSelect } from 'src/atoms/SolidaritaetSelect';

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
