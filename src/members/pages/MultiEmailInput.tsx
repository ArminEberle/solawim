import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
    parseAdditionalEmailReceipients,
    sanitizeAdditionalEmailReceipients,
} from 'src/members/utils/additionalEmailReceipients';
import validator from 'validator';

export type MultiEmailInputProps = {
    label: string;
    value: string[];
    onChange: (emails: string[]) => void;
    disabled?: boolean;
    maxLength?: number;
    name?: string;
    title?: string;
};

export const MultiEmailInput = ({
    label,
    value,
    onChange,
    disabled = false,
    maxLength = 500,
    name,
    title,
}: MultiEmailInputProps) => {
    const [draft, setDraft] = useState('');

    const parsedDraft = parseAdditionalEmailReceipients(draft);
    const trimmedDraft = draft.trim();
    const invalidEmail = parsedDraft.find(email => !validator.isEmail(email, { ignore_max_length: true }));
    const errorMessage = invalidEmail ? `Ungültige E-Mail-Adresse: ${invalidEmail}` : undefined;
    const canAdd = parsedDraft.length > 0 && trimmedDraft.length > 0 && !invalidEmail && !disabled;

    const handleRemove = (email: string) => {
        if (disabled) {
            return;
        }
        const next = sanitizeAdditionalEmailReceipients(
            value.filter(entry => entry.toLowerCase() !== email.toLowerCase()),
        );
        onChange(next);
    };

    const handleAdd = () => {
        if (disabled || !canAdd) {
            return;
        }
        const next = sanitizeAdditionalEmailReceipients([...value, ...parsedDraft]);
        onChange(next);
        setDraft('');
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="input-wrapper">
            <label
                className="control-label"
                htmlFor={name}
            >
                {label}
            </label>
            {value.length > 0 && (
                <ul
                    style={{
                        listStyle: 'none',
                        margin: '0.5rem 0',
                        padding: 0,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                    }}
                >
                    {value.map(email => (
                        <li
                            key={email}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: '#f1f1f1',
                                borderRadius: '999px',
                                padding: '0.25rem 0.5rem',
                            }}
                        >
                            <span>{email}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(email)}
                                className="btn"
                                style={{
                                    padding: '0.1rem 0.4rem',
                                    lineHeight: 1,
                                }}
                                disabled={disabled}
                                aria-label={`E-Mail ${email} entfernen`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                }}
            >
                <input
                    id={name}
                    name={name}
                    type="text"
                    className="form-control"
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    maxLength={maxLength}
                    placeholder="E-Mail-Adresse hinzufügen"
                    title={title}
                    style={{ flex: 1 }}
                    aria-invalid={errorMessage ? 'true' : undefined}
                />
                <button
                    type="button"
                    className="btn"
                    onClick={handleAdd}
                    disabled={!canAdd}
                >
                    Hinzufügen
                </button>
            </div>
            {errorMessage && (
                <small style={{ color: '#b3261e', display: 'block', marginTop: '0.25rem' }}>{errorMessage}</small>
            )}
        </div>
    );
};
