import React from 'react';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';

export const VereinsverwaltungPage = () => {
    return <LoggedInScope>
        <>
            <h3>Vereinsverwaltung</h3>
        Hello
        </>
    </LoggedInScope>;
};