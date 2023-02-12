import React from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export const Horizontal = (props: React.PropsWithChildren & JustifyContentProp) =>
    <div className={`dfh jc-${props.jc ?? 'center'}`}>{props.children}</div>;