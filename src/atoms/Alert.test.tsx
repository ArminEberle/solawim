import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Alert } from 'src/atoms/Alert';

describe('Alert', () => {
    test('renders provided children', () => {
        render(
            <Alert>
                <span>Test message</span>
            </Alert>,
        );
        expect(screen.getByText('Test message')).toBeInTheDocument();
    });
});
