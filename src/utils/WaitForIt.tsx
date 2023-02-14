import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { LoadingIndicator } from 'src/atoms/LoadingIndicator';

export type WaitForItProps<C extends ReactNode | undefined> = {
    redo?: boolean;
    callback: () => Promise<void>;
    children?: C
} ;

export function WaitForIt<C extends ReactNode | undefined>(options: WaitForItProps<C>): JSX.Element {
    useEffect(() => {
        if (options.redo) {
            try {
                void options.callback();
            } catch (e) {
                console.log(e);
            }
        }
    });
    return options.redo
        ? <LoadingIndicator /> as JSX.Element
        : options.children as JSX.Element ;
}