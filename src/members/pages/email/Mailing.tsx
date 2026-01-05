import { useState } from 'react';
import { ComposeEmailTab } from 'src/members/pages/email/ComposeEmailTab';
import { EmailHistoryTab } from 'src/members/pages/email/EmailHistoryTab';
import type { AllMembersData } from 'src/members/types/AllMembersData';

const TAB_COMPOSE = 'compose';
const TAB_HISTORY = 'history';

type TabKey = typeof TAB_COMPOSE | typeof TAB_HISTORY;

type MailingProps = {
    members: AllMembersData;
    isMembersLoading: boolean;
};

export const Mailing = ({ members, isMembersLoading }: MailingProps) => {
    const [activeTab, setActiveTab] = useState<TabKey>(TAB_COMPOSE);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyRefreshToken, setHistoryRefreshToken] = useState(0);

    const handleEmailSent = () => {
        setHistoryRefreshToken(token => token + 1);
        setHistoryPage(1);
    };

    const tabButtonStyle = (tab: TabKey) => ({
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid #0a6ebd' : '3px solid transparent',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontWeight: activeTab === tab ? 600 : 400,
        color: activeTab === tab ? '#202020' : '#555555',
    });

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    borderBottom: '1px solid #d0d0d0',
                }}
            >
                <button
                    type="button"
                    style={tabButtonStyle(TAB_COMPOSE)}
                    onClick={() => setActiveTab(TAB_COMPOSE)}
                >
                    Neue Email
                </button>
                <button
                    type="button"
                    style={tabButtonStyle(TAB_HISTORY)}
                    onClick={() => setActiveTab(TAB_HISTORY)}
                >
                    Gesendete Emails
                </button>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
                {activeTab === TAB_COMPOSE ? (
                    <ComposeEmailTab
                        members={members}
                        isMembersLoading={isMembersLoading}
                        onEmailSent={handleEmailSent}
                    />
                ) : (
                    <EmailHistoryTab
                        isActive={activeTab === TAB_HISTORY}
                        page={historyPage}
                        onPageChange={setHistoryPage}
                        refreshToken={historyRefreshToken}
                    />
                )}
            </div>
        </div>
    );
};
