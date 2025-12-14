import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { Select } from 'src/atoms/Select';
import { describe, expect, test, vi } from 'vitest';

describe('Select', () => {
    test('renders options and emits change events', () => {
        const handleChange = vi.fn();
        render(
            <Select
                label="Choice"
                name="choice"
                options={['A', 'B']}
                value="A"
                onChange={handleChange}
            />,
        );
        const select = screen.getByRole('combobox');
        const options = within(select).getAllByRole('option');
        expect(options).toHaveLength(2);
        fireEvent.change(select, { target: { value: 'B' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
