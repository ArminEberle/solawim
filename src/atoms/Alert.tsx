import 'src/atoms/Alert.css';

import React, { useEffect, useRef } from 'react';

export const Alert = (options: React.PropsWithChildren) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        setTimeout(() => {
            ref.current?.classList.add('solawim-alert-old');
        }, 3000);
    });
    return <div className="solawim-alert" ref={ref}>{options.children}</div>;
};