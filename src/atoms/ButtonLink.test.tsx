import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ButtonLink } from 'src/atoms/ButtonLink';

describe('ButtonLink', () => {
    test('navigates to the provided href when clicked', () => {
        const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
        const setHref = vi.fn();
        const stubLocation = {
            _href: 'http://localhost/',
            set href(value: string) {
                setHref(value);
                this._href = value;
            },
            get href() {
                return this._href;
            },
        };

        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: stubLocation,
        });

        try {
            render(
                <ButtonLink
                    buttonType="primary"
                    href="/sample"
                >
                    Navigate
                </ButtonLink>,
            );
            fireEvent.click(screen.getByRole('button', { name: 'Navigate' }));
            expect(setHref).toHaveBeenCalledWith('/sample');
        } finally {
            if (originalDescriptor) {
                Object.defineProperty(window, 'location', originalDescriptor);
            }
        }
    });
});
