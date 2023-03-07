import React, { useMemo, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { getAllMemberData } from 'src/api/getAllMemberData';
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

export const VereinsverwaltungPage = () => {
    const [allMembers, setAllMembers] = useState([] as AllMembersData);
    const [reloadState, setReloadState] = useState(true);
    const [overallSumState, setOverallSumState] = useState(emptyOverallSumState());

    // const [membersCollapsed, setMembersCollapsed] = useState(true);

    useMemo(() => {
        setOverallSumState(computeAllMembersSums(allMembers));
    }, [allMembers]);

    return <div style={{padding: '0.5rem'}} onKeyDown={e => e.stopPropagation()}>
    <LoggedInScope loginHint={
        <ButtonLink buttonType="primary" href="/anmelden/?redirect_to=/vereinsverwaltung">Bitte log Dich erst ein.</ButtonLink>
    }>
        <WaitForIt redo={reloadState}
            callback={async function (): Promise<void> {
                setReloadState(false);
                const memberData = await getAllMemberData();
                setAllMembers(memberData);
            }}>
            <Page>
                <CollapsibleSection title='Übersicht' stateHandler={useState(false)}>
                    <VereinsverwaltungSums sumState={overallSumState.total} />
                </CollapsibleSection>
                <br/>
                <CollapsibleSection title='Übersicht nach Abholraum' stateHandler={useState(true)}>
                    {abholraumOptions.map(option => <>
                        <br/>
                        <h3>{option.display}</h3>
                        <VereinsverwaltungSums sumState={overallSumState[option.value]} />
                    </>)}
                </CollapsibleSection>
                <br/>
                <CollapsibleSection 
                    title='Mitglieder' 
                    stateHandler={useState(true)}
                    // collapsed={membersCollapsed} onChange={setMembersCollapsed}
                >
                            <Vertical>
{
    allMembers.map(memberRow => <>
        <MemberDetailMolecule 
            key={memberRow.id} 
            data={memberRow}
            reloadCb={() => {
                console.log('triggering reload');
                setReloadState(true)}
            } 
        />
        <br/>
    </>
    )
    //     {
    //     return <>
    //     <form onSubmit={preventDefault} style={{border: 'solid 1pt black', padding: '1rem'}}>
    //         {memberRow.membership && <>
    //         <h3>{memberRow.membership?.firstname} {memberRow.membership?.lastname}</h3>
    //         <Checkbox value={memberRow.membership?.member}>Ist dabei</Checkbox>
    //         <Horizontal>
    //             <Input label='Vorname' value={memberRow.membership?.firstname} maxlen={30}/>
    //             <Input label='Nachname' value={memberRow.membership?.lastname} maxlen={30}/>
    //         </Horizontal>
    //         </>}
    //         <Horizontal key={memberRow.id} jc='flex-start' >
    //             <Input label='ID' maxWidth={5} maxlen={10} value={memberRow.id} disabled={true} />
    //             <Input label='Username' maxlen={10} value={memberRow.user_nicename} disabled={true} />
    //             <Input label='Telefon' maxlen={30} value={memberRow.membership?.tel} disabled={true} />
    //             <Input label='Email' maxlen={30} value={memberRow.user_email} disabled={true} />
    //             <Button onClick={() => window.open('mailto:'+memberRow.user_email)} buttonType="secondary" style={{alignSelf: 'center'}}>Mail</Button>
    //         </Horizontal>
    //         <Select
    //                 options={abholraumOptions}
    //                 disabled={!memberRow.membership?.member}
    //                 value={memberRow.membership?.abholraum}
    //             />
    //     </form>
    //     </>
    // })
    // })
}
                            </Vertical>
                </CollapsibleSection>
            </Page>
        </WaitForIt>
    </LoggedInScope>
    </div>;
};

