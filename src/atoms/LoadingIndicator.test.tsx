import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from 'src/atoms/LoadingIndicator';
import { describe, expect, test } from 'vitest';

describe('LoadingIndicator', () => {
    test('shows loading text', () => {
        render(<LoadingIndicator />);
        expect(screen.getByText('Lade')).toBeInTheDocument();
        expect(screen.getByText('Daten')).toBeInTheDocument();
    });
});
