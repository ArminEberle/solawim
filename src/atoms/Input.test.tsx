import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from 'src/atoms/Input';
import { describe, expect, test, vi } from 'vitest';

describe('Input', () => {
    test('fires change and validator with updated value', () => {
        const handleChange = vi.fn();
        const validator = vi.fn().mockReturnValue(null);
        render(
            <Input
                label="Name"
                name="name"
                maxlen={10}
                value="Initial"
                onChange={handleChange}
                validator={validator}
            />,
        );
        const input = screen.getByPlaceholderText('Name');
        fireEvent.change(input, { target: { value: 'Updated' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(validator).toHaveBeenCalledWith('Updated');
    });
});
