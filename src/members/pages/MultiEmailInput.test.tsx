import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { MultiEmailInput } from 'src/members/pages/MultiEmailInput';
import { afterEach, describe, expect, it, vi } from 'vitest';

const renderComponent = (props?: Partial<ComponentProps<typeof MultiEmailInput>>) => {
    const defaultProps = {
        label: 'Zusätzliche E-Mail-Empfänger*innen',
        value: [],
        onChange: vi.fn(),
        disabled: false,
        maxLength: 500,
        name: 'additionalEmailReceipients',
        title: 'Mehrere E-Mail-Adressen durch Komma, Semikolon oder Zeilenumbruch trennen.',
    } satisfies ComponentProps<typeof MultiEmailInput>;

    return render(
        <MultiEmailInput
            {...defaultProps}
            {...props}
        />,
    );
};

describe('MultiEmailInput', () => {
    afterEach(() => {
        cleanup();
    });

    it('adds valid email addresses entered into the input field', () => {
        const handleChange = vi.fn();
        renderComponent({ onChange: handleChange });

        const input = screen.getByPlaceholderText('E-Mail-Adresse hinzufügen');
        const addButton = screen.getByRole('button', { name: 'Hinzufügen' });

        fireEvent.change(input, { target: { value: 'valid@example.com' } });
        expect(addButton).not.toBeDisabled();

        fireEvent.click(addButton);

        expect(handleChange).toHaveBeenCalledWith(['valid@example.com']);
        expect(input).toHaveValue('');
    });

    it('does not add invalid email addresses and shows an error message', () => {
        const handleChange = vi.fn();
        renderComponent({ onChange: handleChange });

        const input = screen.getByPlaceholderText('E-Mail-Adresse hinzufügen');
        const addButton = screen.getByRole('button', { name: 'Hinzufügen' });

        fireEvent.change(input, { target: { value: 'invalid-email' } });
        expect(addButton).toBeDisabled();
        expect(screen.getByText('Ungültige E-Mail-Adresse: invalid-email')).toBeInTheDocument();

        fireEvent.click(addButton);
        expect(handleChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('invalid-email');
    });

    it('removes an email address when the remove button is clicked', () => {
        const handleChange = vi.fn();
        renderComponent({ value: ['user1@example.com', 'user2@example.com'], onChange: handleChange });

        const removeButton = screen.getByRole('button', { name: 'E-Mail user1@example.com entfernen' });

        fireEvent.click(removeButton);

        expect(handleChange).toHaveBeenCalledWith(['user2@example.com']);
    });
});
