import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Output } from 'src/atoms/Output';

describe('Output', () => {
    test('renders label and formatted value', () => {
        render(
            <Output
                label="Total"
                value="42"
            />,
        );
        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });
});
