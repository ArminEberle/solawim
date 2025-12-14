import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Checkbox } from 'src/atoms/Checkbox';

describe('Checkbox', () => {
    test('calls onChange when toggled', () => {
        const handleChange = vi.fn();
        render(
            <Checkbox
                name="consent"
                value={false}
                onChange={handleChange}
            >
                Accept
            </Checkbox>,
        );
        fireEvent.click(screen.getByRole('checkbox'));
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
