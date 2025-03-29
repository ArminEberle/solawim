import React from 'react';

export const Alert = (options: React.PropsWithChildren) => {
    return <p className="alert red">{options.children}</p>;
};
