import { render, screen } from '@testing-library/react';
import { InputNumber } from 'src/atoms/InputNumber';
import { describe, expect, test } from 'vitest';

describe('InputNumber', () => {
    test('applies numeric constraints', () => {
        render(
            <InputNumber
                label="Count"
                min={1}
                max={5}
            />,
        );
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveAttribute('min', '1');
        expect(input).toHaveAttribute('max', '5');
    });
});
