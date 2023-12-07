import React, { useContext, useMemo, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { getAllMemberData, useGetAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import 'src/css/form.css';
import { Page } from 'src/layout/Page';
import { Vertical } from 'src/layout/Vertical';
import { MemberDetailMolecule } from 'src/members/pages/MemberDetailMolecule';
import { AllMembersData } from 'src/members/types/AllMembersData';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { WaitForIt } from 'src/utils/WaitForIt';
import { computeAllMembersSums } from './computeAllMembersSums';
import { emptyOverallSumState } from './emptyOverallSumState';
import { VereinsverwaltungSums } from './VereinsverwaltungSums';
import { VereinsverwaltungHistory } from 'src/members/pages/VereinsverwaltungHistory';
import { Button } from 'src/atoms/Button';
import { updateMailingLists } from 'src/api/updateMailingLists';
import { SeasonSelect } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';
import { SeasonContext } from 'src/contexts/SeasonContext';
import { Horizontal } from 'src/layout/Horizontal';
import { useGetSeasons } from 'src/api/useGetSeasons';

export const VereinsverwaltungPage = () => {
    return <RootContext>
        <VereinsverwaltungPageInternal />
    </RootContext>
}

const VereinsverwaltungPageInternal = () => {

    const seasonContext = useContext(SeasonContext);
    const seasonsQuery = useGetSeasons();
    const [season, setSeason] = useState(2024);

    // const [allMembers, setAllMembers] = useState([] as AllMembersData);
    const [reloadState, setReloadState] = useState(true);
    const [overallSumState, setOverallSumState] = useState(emptyOverallSumState());
    const [updateTimestamp, setUpdateTimestamp] = useState(new Date().getTime());

    const [updatingMailingLists, setUpdatingMailingLists] = useState(false);

    // const [membersCollapsed, setMembersCollapsed] = useState(true);

    const allMembersQuery = useGetAllMemberData();

    useMemo(() => {
        setOverallSumState(computeAllMembersSums(allMembersQuery.data));
    }, [allMembersQuery.data]);

    const updateMailingListsAction = () => {
        setUpdatingMailingLists(true);
        void updateMailingLists().then(() => {
            setUpdatingMailingLists(false);
        });
    }

    return <div style={{ padding: '0.5rem', marginTop: '5rem' }} onKeyDown={e => e.stopPropagation()}>
        <LoggedInScope loginHint={
            <ButtonLink buttonType="primary" href="/anmelden/?redirect_to=/vereinsverwaltung">Bitte log Dich erst ein.</ButtonLink>
        }>
            <Page>
                <SeasonContext.Provider value={season}>
                    <div >
                        <label htmlFor="seasonselect">Saison </label>
                        {seasonsQuery.isFetched && (
                            <select name="seasonselect"
                                onChange={(event) => setSeason(Number.parseInt(event.target.value))}
                            >
                                {seasonsQuery.data?.map((season) => <option
                                    value={season} {...(seasonContext === season) ? { selected: true } : {}}
                                >{season} / {season + 1}</option>)}
                            </select>
                        )}
                        {!seasonsQuery.isFetched && (
                            <div>Lade Daten...</div>
                        )}
                    </div>
                </SeasonContext.Provider>

                <Button
                    buttonType='primary'
                    disabled={updatingMailingLists}
                    onClick={updateMailingListsAction}
                >{updatingMailingLists ? 'Mailing Listen werden upgedatet, Seite nicht verlassen...' : 'Mailing Listen updaten'}
                </Button>
                <CollapsibleSection title='Übersicht' stateHandler={useState(false)}>
                    <VereinsverwaltungSums sumState={overallSumState.total} memberData={allMembersQuery.data} />
                </CollapsibleSection>
                <br />
                <CollapsibleSection title='Übersicht nach Abholraum' stateHandler={useState(true)}>
                    {abholraumOptions.map(option => <>
                        <br />
                        <h3>{option.display}</h3>
                        <VereinsverwaltungSums sumState={overallSumState[option.value]} />
                    </>)}
                </CollapsibleSection>
                <br />
                <CollapsibleSection
                    title='Mitglieder'
                    stateHandler={useState(true)}
                >
                    <Vertical>
                        {
                            allMembersQuery.data.map(memberRow => <>
                                <MemberDetailMolecule
                                    key={memberRow.id}
                                    data={memberRow}
                                    reloadCb={() => {
                                        console.log('triggering reload');
                                        setReloadState(true)
                                    }
                                    }
                                />
                                <br />
                            </>
                            )
                        }
                    </Vertical>
                </CollapsibleSection>
                <CollapsibleSection title='Änderungshistorie' stateHandler={useState(false)}>
                    <VereinsverwaltungHistory updateTimestamp={updateTimestamp} />
                </CollapsibleSection>
            </Page>
        </LoggedInScope>
    </div >;
};

