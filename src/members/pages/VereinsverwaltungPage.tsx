import React, { useMemo, useState } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import 'src/css/form.css';
import { SeasonSelect, useSeason } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';
import { Page } from 'src/layout/Page';
import { Vertical } from 'src/layout/Vertical';
import { MemberDetailMolecule } from 'src/members/pages/MemberDetailMolecule';
import { Mailing } from 'src/members/pages/Mailing';
import { VereinsverwaltungHistory } from 'src/members/pages/VereinsverwaltungHistory';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { VereinsverwaltungSums } from './VereinsverwaltungSums';
import { computeAllMembersSums } from './computeAllMembersSums';
import { emptyOverallSumState } from './emptyOverallSumState';

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

    const historyStateHandler = useState(true);
    const [historyCollapsed] = historyStateHandler;

    const season = useSeason();

    const allMembersQuery = useGetAllMemberData();

    useMemo(() => {
        setOverallSumState(computeAllMembersSums(allMembersQuery.data, season));
    }, [allMembersQuery.data]);

    return (
        <div
            style={{ padding: '0.5rem', marginTop: '5rem' }}
            onKeyDown={e => e.stopPropagation()}
        >
            <Page>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <label htmlFor="seasonselect">Saison </label>
                    <SeasonSelect name="seasonselect" />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('verwaltung')}
                            aria-pressed={activeTab === 'verwaltung'}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid var(--color-primary, #008c45)',
                                backgroundColor:
                                    activeTab === 'verwaltung' ? 'var(--color-primary, #008c45)' : 'transparent',
                                color: activeTab === 'verwaltung' ? '#fff' : 'inherit',
                                cursor: 'pointer',
                            }}
                        >
                            Verwaltung
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('mailing')}
                            aria-pressed={activeTab === 'mailing'}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid var(--color-primary, #008c45)',
                                backgroundColor:
                                    activeTab === 'mailing' ? 'var(--color-primary, #008c45)' : 'transparent',
                                color: activeTab === 'mailing' ? '#fff' : 'inherit',
                                cursor: 'pointer',
                            }}
                        >
                            Mailing
                        </button>
                    </div>
                </div>
                {activeTab === 'verwaltung' ? (
                    <>
                        <CollapsibleSection
                            title="Übersicht"
                            stateHandler={useState(false)}
                        >
                            <VereinsverwaltungSums
                                sumState={overallSumState.total}
                                withButtons={true}
                            />
                        </CollapsibleSection>
                        <br />
                        <CollapsibleSection
                            title="Übersicht nach Abholraum"
                            stateHandler={useState(true)}
                        >
                            {abholraumOptions.map(option => {
                                return (
                                    <div key={option.value ?? 'none'}>
                                        <br />
                                        <h3>{option.display}</h3>
                                        <VereinsverwaltungSums
                                            sumState={overallSumState[option.value]}
                                            withButtons={false}
                                        />
                                    </div>
                                );
                            })}
                        </CollapsibleSection>
                        <br />
                        <CollapsibleSection
                            title="Mitglieder"
                            stateHandler={useState(true)}
                        >
                            <Vertical>
                                {allMembersQuery.data.map(memberRow => {
                                    return (
                                        <div
                                            key={memberRow.id}
                                            className="mb-3"
                                        >
                                            <MemberDetailMolecule
                                                key={memberRow.id}
                                                data={memberRow}
                                                reloadCb={() => {
                                                    allMembersQuery.refetch();
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </Vertical>
                        </CollapsibleSection>
                        <CollapsibleSection
                            title="Änderungshistorie"
                            stateHandler={historyStateHandler}
                        >
                            {!historyCollapsed && <VereinsverwaltungHistory updateTimestamp={updateTimestamp} />}
                        </CollapsibleSection>
                    </>
                ) : (
                    <Mailing />
                )}
            </Page>
        </div>
    );
};
