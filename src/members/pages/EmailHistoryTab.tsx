// Helper to split recipientStatuses into successful and unsuccessful arrays
function splitRecipientStatuses(
    recipientStatuses: Record<string, { status: string; statusCode: string | null }> | undefined | null,
): { successful: string[]; queued: string[]; unsuccessful: Array<[string, string | null]> } {
    if (!recipientStatuses || typeof recipientStatuses !== 'object') {
        return { successful: [], queued: [], unsuccessful: [] };
    }
    const successful: string[] = [];
    const queued: string[] = [];
    const unsuccessful: Array<[string, string | null]> = [];
    for (const [email, s] of Object.entries(recipientStatuses)) {
        if (s?.status === 'success') {
            successful.push(email);
        } else if (s?.status === 'stored') {
            queued.push(email);
        } else {
            unsuccessful.push([email, s.status ?? null]);
        }
    }
    return { successful, queued, unsuccessful };
}

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getEmails } from 'src/api/getEmails';
import { Alert } from 'src/atoms/Alert';
import type { MailRecipientsSelection } from 'src/members/types/MailRecipientsSelection';
import { Abholraum } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';
import type { EmailLogEntry, EmailLogPage, EmailLogStatus } from 'src/types/EmailLog';

const EMAIL_HISTORY_PAGE_SIZE = 25;

const ABHOLRAUM_LABELS: Record<Abholraum, string> = {
    [Abholraum.hutzelberghof]: 'Abholraum: Hutzelberghof',
    [Abholraum.witzenhausen]: 'Abholraum: Witzenhausen',
    [Abholraum.gertenbach]: 'Abholraum: Gertenbach',
};

const PRODUCT_LABELS: Record<Product, string> = {
    [Product.BROT]: 'Produkt: Brot',
    [Product.FLEISCH]: 'Produkt: Fleisch',
    [Product.MILCH]: 'Produkt: Milch',
    [Product.VEGGIE]: 'Produkt: Gemüse',
};

const STATUS_LABELS: Record<EmailLogStatus, string> = {
    stored: 'Entwurf gespeichert',
    processing: 'Versand gestartet',
    success: 'Versandt',
    failed: 'Fehlgeschlagen',
    partially_failed: 'Teilweise fehlgeschlagen',
};

const formatDateTime = (value: string): string => {
    if (!value) {
        return '-';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleString('de-DE');
};

const describeSelection = (selection?: MailRecipientsSelection): string[] => {
    if (!selection) {
        return [];
    }
    const labels: string[] = [];
    if (selection.allMembers) {
        labels.push('Alle Mitglieder');
    }
    if (selection.activeMembers) {
        labels.push('Aktive Mitglieder');
    }
    if (Array.isArray(selection.abholraeume)) {
        selection.abholraeume.forEach(abholraum => {
            const label = ABHOLRAUM_LABELS[abholraum];
            if (label) {
                labels.push(label);
            }
        });
    }
    if (Array.isArray(selection.products)) {
        selection.products.forEach(product => {
            const label = PRODUCT_LABELS[product];
            if (label) {
                labels.push(label);
            }
        });
    }
    return labels;
};

export type EmailHistoryTabProps = {
    isActive: boolean;
    page: number;
    onPageChange: (page: number) => void;
    refreshToken: number;
};

export const EmailHistoryTab = ({ isActive, page, onPageChange, refreshToken }: EmailHistoryTabProps) => {
    const [selectedEmail, setSelectedEmail] = useState<EmailLogEntry | null>(null);

    const { data, isLoading, isError, error, isFetching } = useQuery<EmailLogPage, Error, EmailLogPage>({
        queryKey: ['emailLogs', page, EMAIL_HISTORY_PAGE_SIZE, refreshToken],
        queryFn: () => getEmails(page, EMAIL_HISTORY_PAGE_SIZE),
        enabled: isActive,
    });

    useEffect(() => {
        if (!isActive) {
            setSelectedEmail(null);
        }
    }, [isActive]);

    useEffect(() => {
        setSelectedEmail(null);
    }, [page]);

    if (!isActive) {
        return null;
    }

    const currentPage = data?.page ?? page;
    const pageSize = data?.pageSize ?? EMAIL_HISTORY_PAGE_SIZE;
    const totalItems = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const items = data?.items ?? [];

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const handleRowClick = (entry: EmailLogEntry) => {
        setSelectedEmail(entry);
    };

    const closeModal = () => {
        setSelectedEmail(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isError && <Alert>Fehler beim Laden der E-Mails: {error?.message}</Alert>}
            <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f7f7f7', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Erstellt am</th>
                            <th style={{ padding: '0.75rem' }}>Betreff</th>
                            <th style={{ padding: '0.75rem' }}>Status</th>
                            <th style={{ padding: '0.75rem' }}>Gruppen</th>
                            <th style={{ padding: '0.75rem' }}>Empfänger insgesamt</th>
                            <th style={{ padding: '0.75rem' }}>Versendet</th>
                            <th style={{ padding: '0.75rem' }}>In Warteschlange</th>
                            <th style={{ padding: '0.75rem' }}>Versandfehler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    style={{ padding: '1rem', textAlign: 'center' }}
                                >
                                    Lade Daten …
                                </td>
                            </tr>
                        )}
                        {!isLoading && items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    style={{ padding: '1rem', textAlign: 'center' }}
                                >
                                    Keine E-Mails gefunden.
                                </td>
                            </tr>
                        )}
                        {items.map(entry => {
                            const selectionLabels = describeSelection(entry.content?.selection);
                            const selectionText = selectionLabels.length > 0 ? selectionLabels.join(', ') : '–';
                            const subject = entry.subject?.trim() ?? '–';
                            const statusText = STATUS_LABELS[entry.status] ?? entry.status;
                            const totalRecipients = entry.recipientStatuses
                                ? Object.keys(entry.recipientStatuses).length
                                : 0;
                            const split = splitRecipientStatuses(entry.recipientStatuses);
                            const sentCount = split.successful.length;
                            const failedCount = split.unsuccessful.length;
                            const queuedCount = split.queued.length;

                            // Number of intended, but not listed in mailjet recipients

                            return (
                                <tr
                                    key={entry.id}
                                    onClick={() => handleRowClick(entry)}
                                    style={{ cursor: 'pointer', borderTop: '1px solid #e0e0e0' }}
                                >
                                    <td style={{ padding: '0.75rem' }}>{formatDateTime(entry.createdAt)}</td>
                                    <td style={{ padding: '0.75rem' }}>{subject}</td>
                                    <td style={{ padding: '0.75rem' }}>{statusText}</td>
                                    {/* Gruppen */}
                                    <td style={{ padding: '0.75rem' }}>{selectionText}</td>
                                    {/* Empfänger insgesamt */}
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{totalRecipients}</td>
                                    {/* Versendet */}
                                    <th style={{ padding: '0.75rem' }}>{sentCount}</th>
                                    {/* In Warteschlange */}
                                    <th style={{ padding: '0.75rem' }}>{queuedCount}</th>
                                    {/* Versandfehler */}
                                    <th style={{ padding: '0.75rem' }}>{failedCount}</th>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                }}
            >
                <span>
                    Seite {currentPage} von {totalPages} (insgesamt {totalItems} Einträge)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
                        disabled={!canGoPrev || isLoading}
                    >
                        Zurück
                    </button>
                    <button
                        className="btn"
                        type="button"
                        onClick={() => canGoNext && onPageChange(currentPage + 1)}
                        disabled={!canGoNext || isLoading}
                    >
                        Weiter
                    </button>
                </div>
            </div>
            {isFetching && !isLoading && <small>Aktualisiere Daten …</small>}
            {selectedEmail && (
                <EmailDetailsModal
                    email={selectedEmail}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

// --- EmailDetailsModal component ---

type EmailDetailsModalProps = {
    email: EmailLogEntry;
    onClose: () => void;
};

const EmailDetailsModal = ({ email, onClose }: EmailDetailsModalProps) => {
    const memoSplit = useMemo(
        () =>
            typeof email.recipientStatuses === 'object' && email.recipientStatuses !== null
                ? splitRecipientStatuses(email.recipientStatuses)
                : null,
        [email.recipientStatuses],
    );
    const successful = memoSplit ? memoSplit.successful : [];
    const unsuccessful = memoSplit ? memoSplit.unsuccessful : [];
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 1000,
            }}
        >
            <div
                onClick={event => event.stopPropagation()}
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    maxWidth: '760px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                <div>
                    <h3 style={{ marginTop: 0 }}>Betreff: {email.subject ?? 'Kein Betreff'}</h3>
                    <p>
                        <strong>Erstellt am:</strong> {formatDateTime(email.createdAt)}
                    </p>
                    <p>
                        <strong>Status:</strong> {STATUS_LABELS[email.status] ?? email.status}
                    </p>
                    {email.failureReason && (
                        <p>
                            <strong>Fehlergrund:</strong> {email.failureReason}
                        </p>
                    )}
                    <p>
                        <strong>Saison:</strong> {email.season ?? '–'}
                    </p>
                    <p>
                        <strong>Auswahl:</strong> {(() => {
                            const labels = describeSelection(email.content?.selection);
                            return labels.length > 0 ? labels.join(', ') : '–';
                        })()}
                    </p>
                </div>
                <div>
                    <h4>Empfänger</h4>
                    <p>
                        <strong>Mitglieds-IDs:</strong>{' '}
                        {email.content?.recipients?.length ? email.content.recipients.join(', ') : 'Keine'}
                    </p>
                    <p>
                        <strong>Zusätzliche Adressen:</strong>{' '}
                        {email.content?.additionalRecipients?.length
                            ? email.content.additionalRecipients.join(', ')
                            : 'Keine'}
                    </p>
                    <p>
                        <strong>Testmodus:</strong> {email.content?.emailTest ? 'Ja' : 'Nein'}
                    </p>
                    {email.recipientStatuses && typeof email.recipientStatuses === 'object' ? (
                        <>
                            <p>
                                <strong>Nicht zugestellt ({unsuccessful.length}):</strong>{' '}
                                {unsuccessful.length
                                    ? unsuccessful
                                          .map(([addr, state]) => `${addr}${state ? ` (${state})` : ''}`)
                                          .join(', ')
                                    : 'Keine'}
                            </p>
                            <p>
                                <strong>Erfolgreich gesendet ({successful.length}):</strong>{' '}
                                {successful.length ? successful.join(', ') : 'Keine'}
                            </p>
                        </>
                    ) : null}
                </div>
                <div>
                    <h4>Nachricht</h4>
                    <pre
                        style={{
                            whiteSpace: 'pre-wrap',
                            backgroundColor: '#f6f6f6',
                            padding: '1rem',
                            borderRadius: '4px',
                        }}
                    >
                        {email.content?.body ?? ''}
                    </pre>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn"
                        type="button"
                        onClick={onClose}
                    >
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};
