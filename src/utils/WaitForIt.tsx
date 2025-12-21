import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { LoadingIndicator } from 'src/atoms/LoadingIndicator';

export type WaitForItProps = {
    redo?: boolean;
    callback: () => Promise<void>;
    children?: ReactNode;
};

export const WaitForIt = (options: WaitForItProps): ReactElement => {
    useEffect(() => {
        if (options.redo) {
            try {
                void options.callback();
            } catch (e) {
                console.log(e);
            }
        }
    }, [options.redo]);
    return options.redo ? <LoadingIndicator /> : <>{options.children}</>;
};
