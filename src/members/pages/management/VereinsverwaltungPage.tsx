import { useMemo, useState } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { Button } from 'src/atoms/Button';
import { ButtonLink } from 'src/atoms/ButtonLink';
import { SeasonSelect, useSeason } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';
import { Page } from 'src/layout/Page';
import { Mailing } from 'src/members/pages/email/Mailing';
import { VereinsverwaltungTab } from 'src/members/pages/management/VereinsverwaltungTab';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { computeAllMembersSums } from '../../utils/computeAllMembersSums';
import { emptyOverallSumState } from '../../utils/emptyOverallSumState';

export const VereinsverwaltungPage = () => {
    return (
        <LoggedInScope
            loginHint={
                <ButtonLink
                    buttonType="primary"
                    href="/anmelden/?redirect_to=/vereinsverwaltung"
                >
                    Bitte log Dich erst ein.
                </ButtonLink>
            }
        >
            <RootContext>
                <VereinsverwaltungPageInternal />
            </RootContext>
        </LoggedInScope>
    );
};

const VereinsverwaltungPageInternal = () => {
    const [overallSumState, setOverallSumState] = useState(emptyOverallSumState());
    const [updateTimestamp] = useState(new Date().getTime());
    const [activeTab, setActiveTab] = useState<'verwaltung' | 'mailing'>('verwaltung');

    const season = useSeason();

    const allMembersQuery = useGetAllMemberData();

    useMemo(() => {
        setOverallSumState(computeAllMembersSums(allMembersQuery.data, season));
    }, [allMembersQuery.data, season]);

    return (
        <div
            style={{ padding: '0.5rem', marginTop: '5rem' }}
            onKeyDown={e => e.stopPropagation()}
        >
            <Page>
                <div
                    style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                    className="noprint"
                >
                    <label htmlFor="seasonselect">Saison </label>
                    <div>
                        <SeasonSelect name="seasonselect" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                            onClick={() => setActiveTab('verwaltung')}
                            aria-pressed={activeTab === 'verwaltung'}
                            style={{
                                backgroundColor:
                                    activeTab === 'verwaltung' ? 'var(--color-primary, #008c45)' : 'transparent',
                                color: activeTab === 'verwaltung' ? '#fff' : 'inherit',
                            }}
                        >
                            Verwaltung
                        </Button>
                        <Button
                            onClick={() => setActiveTab('mailing')}
                            aria-pressed={activeTab === 'mailing'}
                            style={{
                                backgroundColor:
                                    activeTab === 'mailing' ? 'var(--color-primary, #008c45)' : 'transparent',
                                color: activeTab === 'mailing' ? '#fff' : 'inherit',
                            }}
                        >
                            Mailing
                        </Button>
                        <ButtonLink href="/wp-content/plugins/solawim/abholraumzettel.php">Abholraum Zettel</ButtonLink>
                    </div>
                </div>
                {activeTab === 'verwaltung' && (
                    <VereinsverwaltungTab
                        overallSumState={overallSumState}
                        members={allMembersQuery.data}
                        updateTimestamp={updateTimestamp}
                        onReloadMembers={allMembersQuery.refetch}
                    />
                )}
                {activeTab === 'mailing' && (
                    <Mailing
                        members={allMembersQuery.data}
                        isMembersLoading={allMembersQuery.isFetching}
                    />
                )}
            </Page>
        </div>
    );
};
