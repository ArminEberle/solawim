import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { getSettings } from 'src/api/getSettings';
import { setSettings } from 'src/api/setSettings';
import { Alert } from 'src/atoms/Alert';
import { Button } from 'src/atoms/Button';
import { Input } from 'src/atoms/Input';
import type { Settings } from 'src/types/Settings';

export const SettingsTab = () => {
    const queryClient = useQueryClient();
    const [formValues, setFormValues] = useState<Settings>({ EmailSenderAddress: '' });
    const [hasInitialized, setHasInitialized] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { data, isLoading, isError, error } = useQuery<Settings, Error>({
        queryKey: ['settings'],
        queryFn: getSettings,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (data) {
            setFormValues(data);
            setHasInitialized(true);
        }
    }, [data]);

    const saveSettings = useMutation({
        mutationFn: setSettings,
        onSuccess: updatedSettings => {
            queryClient.setQueryData(['settings'], updatedSettings);
            setFormValues(updatedSettings);
            setSuccessMessage('Einstellungen wurden gespeichert.');
        },
        onError: () => {
            setSuccessMessage(null);
        },
    });

    const handleEmailSenderChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextValue = event.target.value;
        setFormValues(current => ({ ...current, EmailSenderAddress: nextValue }));
        setSuccessMessage(null);
    };

    const isDirty = useMemo(() => {
        if (!data) {
            return false;
        }
        return formValues.EmailSenderAddress !== data.EmailSenderAddress;
    }, [data, formValues.EmailSenderAddress]);

    const canSave =
        hasInitialized && isDirty && formValues.EmailSenderAddress.trim().length > 0 && !saveSettings.isPending;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSave) {
            return;
        }
        const trimmedSettings: Settings = {
            EmailSenderAddress: formValues.EmailSenderAddress.trim(),
        };
        setFormValues(trimmedSettings);
        saveSettings.mutate(trimmedSettings);
    };

    const mutationErrorMessage = saveSettings.error instanceof Error ? saveSettings.error.message : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '28rem' }}>
                <h2>Generell</h2>
                {isError && <Alert>Fehler beim Laden der Einstellungen: {error?.message}</Alert>}
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    <Input
                        label="Absender-Adresse für E-Mails"
                        maxlen={150}
                        value={formValues.EmailSenderAddress}
                        onChange={handleEmailSenderChange}
                        required={true}
                        name="email-sender-address"
                        disabled={!hasInitialized || saveSettings.isPending}
                    />
                    {mutationErrorMessage && <Alert>Fehler beim Speichern: {mutationErrorMessage}</Alert>}
                    {successMessage && !isDirty && !saveSettings.isPending && <p>{successMessage}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Button
                            type="submit"
                            disabled={!canSave}
                        >
                            Speichern
                        </Button>
                        {isLoading && !hasInitialized && <span>Lade Einstellungen …</span>}
                        {saveSettings.isPending && <span>Speichere …</span>}
                    </div>
                </form>
            </section>
        </div>
    );
};
