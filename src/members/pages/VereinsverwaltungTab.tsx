import { useState } from 'react';
import { Vertical } from 'src/layout/Vertical';
import { MemberDetailMolecule } from 'src/members/pages/MemberDetailMolecule';
import type { OverallSumState } from 'src/members/pages/emptyOverallSumState';
import { VereinsverwaltungHistory } from 'src/members/pages/VereinsverwaltungHistory';
import { VereinsverwaltungSums } from 'src/members/pages/VereinsverwaltungSums';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import { CollapsibleSection } from 'src/molecules/CollapsibleSection';
import { abholraumOptions } from 'src/utils/abholraumOptions';

export type VereinsverwaltungTabProps = {
    overallSumState: OverallSumState;
    members: AllMembersData;
    updateTimestamp: number;
    onReloadMembers: () => void;
};

export const VereinsverwaltungTab = ({
    overallSumState,
    members,
    updateTimestamp,
    onReloadMembers,
}: VereinsverwaltungTabProps) => {
    const overviewStateHandler = useState(false);
    const abholraumStateHandler = useState(true);
    const membersStateHandler = useState(true);
    const historyStateHandler = useState(true);
    const [historyCollapsed] = historyStateHandler;

    return (
        <>
            <CollapsibleSection
                title="Übersicht"
                stateHandler={overviewStateHandler}
            >
                <VereinsverwaltungSums
                    sumState={overallSumState.total}
                    withButtons={true}
                />
            </CollapsibleSection>
            <br />
            <CollapsibleSection
                title="Übersicht nach Abholraum"
                stateHandler={abholraumStateHandler}
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
                stateHandler={membersStateHandler}
            >
                <Vertical>
                    {members.map(memberRow => {
                        return (
                            <div
                                key={memberRow.id}
                                className="mb-3"
                            >
                                <MemberDetailMolecule
                                    key={memberRow.id}
                                    data={memberRow}
                                    reloadCb={onReloadMembers}
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
    );
};
