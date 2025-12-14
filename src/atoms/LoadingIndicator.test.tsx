import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LoadingIndicator } from 'src/atoms/LoadingIndicator';

describe('LoadingIndicator', () => {
    test('shows loading text', () => {
        render(<LoadingIndicator />);
        expect(screen.getByText('Lade')).toBeInTheDocument();
        expect(screen.getByText('Daten')).toBeInTheDocument();
    });
});
