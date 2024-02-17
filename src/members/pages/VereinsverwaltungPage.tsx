import React, { useMemo, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import 'src/css/form.css';
import { Page } from 'src/layout/Page';
import { Vertical } from 'src/layout/Vertical';
import { MemberDetailMolecule } from 'src/members/pages/MemberDetailMolecule';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { computeAllMembersSums } from './computeAllMembersSums';
import { emptyOverallSumState } from './emptyOverallSumState';
import { VereinsverwaltungSums } from './VereinsverwaltungSums';
import { VereinsverwaltungHistory } from 'src/members/pages/VereinsverwaltungHistory';
import { Button } from 'src/atoms/Button';
import { updateMailingLists } from 'src/api/updateMailingLists';
import { SeasonSelect, useSeason } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';

export const VereinsverwaltungPage = () => {
    return <LoggedInScope
        loginHint={
            <ButtonLink buttonType="primary" href="/anmelden/?redirect_to=/vereinsverwaltung">Bitte log Dich erst ein.</ButtonLink>
        }>
        <RootContext>
            <VereinsverwaltungPageInternal />
        </RootContext>
    </LoggedInScope>
}

const VereinsverwaltungPageInternal = () => {

    const [overallSumState, setOverallSumState] = useState(emptyOverallSumState());
    const [updateTimestamp,] = useState(new Date().getTime());

    const [updatingMailingLists, setUpdatingMailingLists] = useState(false);

    const season = useSeason();

    // const [membersCollapsed, setMembersCollapsed] = useState(true);

    const allMembersQuery = useGetAllMemberData();

    useMemo(() => {
        setOverallSumState(computeAllMembersSums(allMembersQuery.data, season));
    }, [allMembersQuery.data]);

    const updateMailingListsAction = () => {
        setUpdatingMailingLists(true);
        void updateMailingLists().then(() => {
            setUpdatingMailingLists(false);
        });
    }

    return <div style={{ padding: '0.5rem', marginTop: '5rem' }} onKeyDown={e => e.stopPropagation()}>
        <Page>
            <div >
                <label htmlFor="seasonselect">Saison </label>
                <SeasonSelect name="seasonselect" />
            </div>

            <Button
                buttonType='primary'
                disabled={updatingMailingLists}
                onClick={updateMailingListsAction}
            >{updatingMailingLists ? 'Mailing Listen werden upgedatet, Seite nicht verlassen...' : 'Mailing Listen updaten'}
            </Button>
            <CollapsibleSection title='Übersicht' stateHandler={useState(false)}>
                <VereinsverwaltungSums sumState={overallSumState.total} />
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
                                    allMembersQuery.refetch()
                                }}
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
    </div >;
};

