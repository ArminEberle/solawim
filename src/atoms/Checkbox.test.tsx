import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from 'src/atoms/Checkbox';
import { describe, expect, test, vi } from 'vitest';

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
