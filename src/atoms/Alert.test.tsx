import { render, screen } from '@testing-library/react';
import { Alert } from 'src/atoms/Alert';
import { describe, expect, test } from 'vitest';

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
