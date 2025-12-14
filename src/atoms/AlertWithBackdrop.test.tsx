import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { AlertWithBackdrop, showAlertWithBackdrop } from 'src/atoms/AlertWithBackdrop';

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});

describe('AlertWithBackdrop', () => {
    test('calls onClose when button is clicked', () => {
        const onClose = vi.fn();
        render(
            <AlertWithBackdrop
                text="Important"
                onClose={onClose}
            />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'OK' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('showAlertWithBackdrop resolves after closing', async () => {
        const promise = showAlertWithBackdrop('Hello world');
        await waitFor(() => {
            expect(screen.getByText('Hello world')).toBeInTheDocument();
        });
        const buttons = screen.getAllByRole('button', { name: 'OK' });
        fireEvent.click(buttons[buttons.length - 1]);
        await expect(promise).resolves.toBeUndefined();
        await waitFor(() => {
            expect(screen.queryByText('Hello world')).not.toBeInTheDocument();
        });
    });
});
