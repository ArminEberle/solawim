import type { ReactElement, ReactNode } from 'react';
import { useLoggedIn } from 'src/hooks/useLoggedIn';
import { LoginPage } from 'src/members/pages/LoginPage';

type LoggedInScopeProps = {
    children?: ReactNode;
    loginHint?: ReactNode;
};

export const LoggedInScope = ({ children, loginHint }: LoggedInScopeProps): ReactElement => {
    if (useLoggedIn()) {
        return <>{children}</>;
    }
    return <>{loginHint ?? <LoginPage />}</>;
};
