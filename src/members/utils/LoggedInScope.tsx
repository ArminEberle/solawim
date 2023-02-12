import React from 'react';
import { useLoggedIn } from 'src/hooks/useLoggedIn';
import { LoginPage } from 'src/members/pages/LoginPage';

export function LoggedInScope<T extends React.PropsWithChildren, C extends T['children']>(props: T): C | JSX.Element {
    if (useLoggedIn()) {
        return props.children as C;
    }
    return <LoginPage ></LoginPage>;
}