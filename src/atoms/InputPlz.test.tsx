import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { InputPlz } from 'src/atoms/InputPlz';

describe('InputPlz', () => {
    test('normalizes value on change and blur', () => {
        render(
            <InputPlz
                value=""
                required
            />,
        );
        const input = screen.getByPlaceholderText('PLZ') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '12ab3' } });
        expect(input.value).toBe('123');
        fireEvent.blur(input);
        expect(input.value).toBe('00123');
    });
});
