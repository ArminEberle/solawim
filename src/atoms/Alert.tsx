import type { PropsWithChildren } from 'react';

export const Alert = (options: PropsWithChildren) => {
    return <p className="alert red">{options.children}</p>;
};
