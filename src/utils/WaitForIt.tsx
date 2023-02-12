import React, { useEffect } from 'react';
import { LoadingIndicator } from 'src/atoms/LoadingIndicator';

export type WaitForItOptions = {
    redo?: boolean;
    callback: () => Promise<void>;
} & React.PropsWithChildren;

export function WaitForIt<T extends WaitForItOptions, C extends T['children']>(options: T): C | JSX.Element {
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
        ? <LoadingIndicator />
        : options.children as C;
}