import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useMemo, useState } from 'react';
import { sendEmail } from 'src/api/sendEmail';
import { Alert } from 'src/atoms/Alert';
import { Button } from 'src/atoms/Button';
import { Input } from 'src/atoms/Input';
import { useSeason } from 'src/atoms/SeasonSelect';
import { MailRecipientsSelect } from 'src/members/pages/MailRecipientsSelect';
import { computeMailRecipientUserIdsFromMailRecipientsSelection } from 'src/members/pages/computeMailRecipientUserIdsFromMailRecipientsSelection';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { MailRecipientsSelection } from 'src/members/types/MailRecipientsSelection';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';

type MailingProps = {
    members: AllMembersData;
    isMembersLoading: boolean;
};

export const Mailing = ({ members, isMembersLoading }: MailingProps) => {
    const season = useSeason();
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

    const additionalRecipientEmails = useMemo(() => {
        if (recipientIds.length === 0) {
            return [];
        }
        const selectedIds = new Set(recipientIds);
        const collected: string[] = [];

        members.forEach(member => {
            if (!selectedIds.has(member.id)) {
                return;
            }
            const extras = member.membership?.additionalEmailReceipients ?? [];
            extras.forEach(email => {
                if (typeof email !== 'string') {
                    return;
                }
                const trimmed = email.trim();
                if (trimmed.length === 0) {
                    return;
                }
                collected.push(trimmed);
            });
        });

        if (collected.length === 0) {
            return [];
        }

        const uniqueMap: Record<string, string> = {};
        collected.forEach(email => {
            const lower = email.toLowerCase();
            if (!uniqueMap[lower]) {
                uniqueMap[lower] = email;
            }
        });
        return Object.values(uniqueMap);
    }, [members, recipientIds]);

    const sortedMemberNames = useMemo(() => {
        return members
            .filter(member => member.membership)
            .map(member => {
                const firstname = member.membership?.firstname ?? '';
                const lastname = member.membership?.lastname ?? '';
                const primaryName = [firstname, lastname].filter(Boolean).join(' ');
                const label = `${primaryName} (${member.user_nicename})`;
                return {
                    id: member.id,
                    label,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label, 'de', { sensitivity: 'base' }));
    }, [members]);

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
                season,
                emailData: {
                    recipients: recipientIds,
                    subject: subject.trim(),
                    body: body.trim(),
                    additionalRecipients: additionalRecipientEmails,
                    selection,
                },
            });
            setSubject('');
            setBody('');
        } catch (err) {
            // handled by mutation state
        }
    };

    const memberListTitle =
        additionalRecipientEmails.length > 0
            ? `Ausgewählte Empfänger: ${recipientIds.length} Mitglieder (+${additionalRecipientEmails.length} zusätzliche E-Mail-Adressen)`
            : `Ausgewählte Empfänger: ${recipientIds.length}`;

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
                <CollapsibleSection
                    title={memberListTitle}
                    initiallyCollapsed={true}
                >
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {sortedMemberNames.map(member => (
                            <li key={member.id}>{member.label}</li>
                        ))}
                        {additionalRecipientEmails.length > 0 && (
                            <>
                                <li key="extra-heading">
                                    <strong>Zusätzliche E-Mail-Empfänger*innen</strong>
                                </li>
                                {additionalRecipientEmails.map(email => (
                                    <li key={`extra-${email}`}>{email}</li>
                                ))}
                            </>
                        )}
                    </ul>
                </CollapsibleSection>
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
