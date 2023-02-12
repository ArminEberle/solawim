import React from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export const Vertical = (props: React.PropsWithChildren & JustifyContentProp) =>
    <div className={'dfv jc-' + (props.jc ?? 'start')}>{props.children}</div>;