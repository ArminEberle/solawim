import React, { useState } from 'react';
import { getAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import { Page } from 'src/layout/Page';
import { AllMembersData } from 'src/members/types/AllMembersData';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { WaitForIt } from 'src/utils/WaitForIt';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs/esm';
import 'react-tabs/style/react-tabs.css';

export const VereinsverwaltungPage = () => {
    const [allMembers, setAllMembers] = useState([] as AllMembersData);
    const [reloadState, setReloadState] = useState(true);

    return <LoggedInScope loginHint={
        <ButtonLink style="primary" href="/anmelden/?redirect_to=/vereinsverwaltung">Bitte log Dich erst ein.</ButtonLink>
    }>
        <WaitForIt redo={reloadState}
            callback={async function (): Promise<void> {
                setReloadState(false);
                const memberData = await getAllMemberData();
                setAllMembers(memberData);
            }}>
            <Page>
                <article>
                    <Tabs>
                        <TabList>
                            <Tab>Title 1</Tab>
                            <Tab>Title 2</Tab>
                        </TabList>
                        <TabPanel>
                            <h2>Any content 1</h2>
                        </TabPanel>
                        <TabPanel>
                            <h2>Any content 2</h2>
                        </TabPanel>
                    </Tabs>
                </article>
            </Page>
        </WaitForIt>
    </LoggedInScope>;
};