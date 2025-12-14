import { useMemo, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { sendEmail } from 'src/api/sendEmail';
import { Button } from 'src/atoms/Button';
import { Input } from 'src/atoms/Input';
import { Alert } from 'src/atoms/Alert';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { MemberData } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';
import type { MailRecipientsSelection } from 'src/members/pages/MailRecipientsSelect';
import { MailRecipientsSelect } from 'src/members/pages/MailRecipientsSelect';

type MailingProps = {
    members: AllMembersData;
    isMembersLoading: boolean;
};

const PRODUCT_AMOUNT_FIELD_MAP: Record<Product, keyof MemberData> = {
    [Product.BROT]: 'brotMenge',
    [Product.FLEISCH]: 'fleischMenge',
    [Product.MILCH]: 'milchMenge',
    [Product.VEGGIE]: 'veggieMenge',
};

export const Mailing = ({ members, isMembersLoading }: MailingProps) => {
    const [selection, setSelection] = useState<MailRecipientsSelection>({
        abholraeume: [],
        products: [],
        activeMembers: false,
    });
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const sendEmailMutation = useMutation({
        mutationFn: sendEmail,
    });

    const recipientIds = useMemo(() => {
        if (selection.abholraeume.length === 0 && selection.products.length === 0 && !selection.activeMembers) {
            return [];
        }

        return members
            .filter(member => {
                const membership = member.membership;
                if (!membership?.member) {
                    return false;
                }

                const matchesAbholraum =
                    selection.abholraeume.length > 0 &&
                    membership.abholraum !== undefined &&
                    selection.abholraeume.includes(membership.abholraum);

                const matchesActive = selection.activeMembers && membership.active === true;

                const matchesProduct = selection.products.some(product => {
                    const fieldName = PRODUCT_AMOUNT_FIELD_MAP[product];
                    const amount = membership[fieldName];
                    if (typeof amount === 'string') {
                        return amount !== '0';
                    }
                    if (typeof amount === 'number') {
                        return amount > 0;
                    }
                    return amount !== undefined && amount !== null;
                });

                return matchesActive || matchesAbholraum || matchesProduct;
            })
            .map(member => member.id);
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
