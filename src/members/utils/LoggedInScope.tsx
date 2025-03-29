import type { ReactNode } from 'react';
import React from 'react';
import { useLoggedIn } from 'src/hooks/useLoggedIn';
import { LoginPage } from 'src/members/pages/LoginPage';

type LoggedInScopeProps<C extends ReactNode | undefined, L extends ReactNode | undefined> = {
    children?: C;
    loginHint?: L;
};

export function LoggedInScope<C extends ReactNode | undefined, L extends ReactNode | undefined>(
    props: LoggedInScopeProps<C, L>,
): JSX.Element {
    if (useLoggedIn()) {
        return props.children as JSX.Element;
    }
    return (props.loginHint as JSX.Element) || <LoginPage />;
}
