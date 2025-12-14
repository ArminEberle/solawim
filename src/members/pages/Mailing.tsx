import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useMemo, useState } from 'react';
import { sendEmail } from 'src/api/sendEmail';
import { Alert } from 'src/atoms/Alert';
import { Button } from 'src/atoms/Button';
import { Input } from 'src/atoms/Input';
import { MailRecipientsSelect } from 'src/members/pages/MailRecipientsSelect';
import { computeMailRecipientUserIdsFromMailRecipientsSelection } from 'src/members/pages/computeMailRecipientUserIdsFromMailRecipientsSelection';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { MailRecipientsSelection } from './MailRecipientsSelection';

type MailingProps = {
    members: AllMembersData;
    isMembersLoading: boolean;
};

export const Mailing = ({ members, isMembersLoading }: MailingProps) => {
    const [selection, setSelection] = useState<MailRecipientsSelection>({
        abholraeume: [],
        products: [],
        activeMembers: false,
        allMembers: false,
    });
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const sendEmailMutation = useMutation({
        mutationFn: sendEmail,
    });

    const recipientIds = useMemo(() => {
        return computeMailRecipientUserIdsFromMailRecipientsSelection(members, selection);
    }, [members, selection]);

    const canSend =
        recipientIds.length > 0 && subject.trim().length > 0 && body.trim().length > 0 && !sendEmailMutation.isPending;

    const errorMessage = sendEmailMutation.error instanceof Error ? sendEmailMutation.error.message : undefined;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSend) {
            return;
        }

        if (!window.confirm('E-Mail jetzt senden? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            return;
        }

        try {
            await sendEmailMutation.mutateAsync({
                recipients: recipientIds,
                subject: subject.trim(),
                body: body.trim(),
            });
            setSubject('');
            setBody('');
        } catch (err) {
            // handled by mutation state
        }
    };

    return (
        <form
            style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            onSubmit={handleSubmit}
        >
            <div>
                <h3>Empfänger wählen</h3>
                {isMembersLoading && <p>Daten werden geladen …</p>}
                <MailRecipientsSelect
                    value={selection}
                    onChange={setSelection}
                />
                <p style={{ marginTop: '0.75rem' }}>Ausgewählte Empfänger: {recipientIds.length}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                    label="Betreff"
                    maxlen={120}
                    value={subject}
                    onChange={event => setSubject(event.target.value)}
                    required={true}
                />
                <div className="input-wrapper">
                    <label className="control-label">Nachricht</label>
                    <textarea
                        className="form-control"
                        name="mail-body"
                        value={body}
                        onChange={event => setBody(event.target.value)}
                        rows={8}
                        required={true}
                    />
                </div>
            </div>
            {errorMessage && <Alert>Fehler beim Senden: {errorMessage}</Alert>}
            {sendEmailMutation.isSuccess && <p>E-Mail wurde erfolgreich versendet.</p>}
            <div>
                <Button
                    type="submit"
                    disabled={!canSend}
                >
                    Senden
                </Button>
            </div>
        </form>
    );
};
