import { useMutation } from '@tanstack/react-query';
import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from 'react';
import { sendEmail } from 'src/api/sendEmail';
import { Alert } from 'src/atoms/Alert';
import { Button } from 'src/atoms/Button';
import { Checkbox } from 'src/atoms/Checkbox';
import { Input } from 'src/atoms/Input';
import { useSeason } from 'src/atoms/SeasonSelect';
import { MailRecipientsSelect } from 'src/members/pages/email/MailRecipientsSelect';
import { computeMailRecipientUserIdsFromMailRecipientsSelection } from 'src/members/pages/email/computeMailRecipientUserIdsFromMailRecipientsSelection';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { MailRecipientsSelection } from 'src/members/types/MailRecipientsSelection';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';

export type ComposeEmailTabProps = {
    members: AllMembersData;
    isMembersLoading: boolean;
    onEmailSent: () => void;
};

export const ComposeEmailTab = ({ members, isMembersLoading, onEmailSent }: ComposeEmailTabProps) => {
    const season = useSeason();
    const [selection, setSelection] = useState<MailRecipientsSelection>({
        abholraeume: [],
        products: [],
        activeMembers: false,
        allMembers: false,
    });
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isTestEmail, setIsTestEmail] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) {
            return;
        }
        const newFiles = Array.from(files);
        const errors: string[] = [];

        for (const file of newFiles) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                errors.push(`"${file.name}" ist zu groß (max. ${MAX_FILE_SIZE_MB} MB).`);
            }
        }

        const validFiles = newFiles.filter(f => f.size <= MAX_FILE_SIZE_BYTES);
        const combined = [...attachments, ...validFiles];
        if (combined.length > MAX_ATTACHMENTS) {
            errors.push(`Maximal ${MAX_ATTACHMENTS} Anhänge erlaubt.`);
        }

        setAttachments(combined.slice(0, MAX_ATTACHMENTS));

        if (errors.length > 0) {
            window.alert(errors.join('\n'));
        }

        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

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
                    emailTest: isTestEmail,
                },
                attachments,
            });
            if (isTestEmail) {
                setIsTestEmail(false);
            } else {
                setSubject('');
                setBody('');
            }
            setAttachments([]);
            onEmailSent();
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
                <h3>Empfängergruppen wählen - mindestens eine</h3>
                {isMembersLoading && <p>Daten werden geladen …</p>}
                <p>
                    <small>
                        Info: Diese Gruppen hier wirken 'additiv': Wenn ihr mehrere Gruppen auswählt, werden alle
                        Mitglieder der ausgewählten Gruppen als Mailempfänger verwendet. Also zum Beispiel: 'Produkt
                        Gemüse' und 'Abholraum Witzenhausen': Alle Mitglieder, die Gemüse beziehen, erhalten die E-Mail,
                        ebenso alle Mitglieder, die im Abholraum Witzenhausen ihre Anteile abholen – auch wenn sie keine
                        Gemüseanteile beziehen. Eine Auswahl 'Nur Gemüse-Mitglieder die im Abholraum Witzenhausen
                        abholen' geht nicht.
                    </small>
                </p>
                <MailRecipientsSelect
                    value={selection}
                    onChange={setSelection}
                />
                <CollapsibleSection
                    title={memberListTitle}
                    initiallyCollapsed={true}
                >
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {sortedMemberNames
                            .filter(member => recipientIds.includes(member.id))
                            .map(member => (
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
                <div className="input-wrapper">
                    <label className="control-label">
                        Anhänge (max. {MAX_ATTACHMENTS} Dateien, je max. {MAX_FILE_SIZE_MB} MB)
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={handleFilesSelected}
                        className="form-control"
                    />
                    {attachments.length > 0 && (
                        <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '0.5rem' }}>
                            {attachments.map((file, index) => (
                                <li
                                    key={`${file.name}-${index}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.25rem',
                                    }}
                                >
                                    <span>
                                        {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="btn"
                                        style={{
                                            padding: '0.1rem 0.4rem',
                                            lineHeight: 1,
                                        }}
                                        aria-label={`Anhang ${attachments[index].name} entfernen`}
                                        title={`Anhang ${attachments[index].name} entfernen`}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <Checkbox
                    value={isTestEmail}
                    onChange={event => setIsTestEmail(event.target.checked)}
                >
                    <strong>Testversand</strong> – E-Mail nur an die konfigurierte Absender-Adresse senden und
                    Empfängerliste an die Nachricht anhängen.
                </Checkbox>
            </div>
            {errorMessage && <Alert>Fehler beim Speichern der E-Mail: {errorMessage}</Alert>}
            {sendEmailMutation.isSuccess && <p>E-Mail wurde versendet.</p>}
            <div>
                <Button
                    type="submit"
                    disabled={!canSend}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}
                >
                    {sendEmailMutation.isPending && (
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 50 50"
                                style={{
                                    marginRight: 4,
                                    verticalAlign: 'middle',
                                    animation: 'spin 1s linear infinite',
                                }}
                            >
                                <circle
                                    cx="25"
                                    cy="25"
                                    r="20"
                                    fill="none"
                                    stroke="#888"
                                    strokeWidth="5"
                                    strokeDasharray="31.4 31.4"
                                    strokeLinecap="round"
                                ></circle>
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                            </svg>
                        </span>
                    )}
                    Senden
                </Button>
            </div>
        </form>
    );
};
