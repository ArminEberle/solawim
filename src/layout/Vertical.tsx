import React from 'react';
import { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export default (props: React.PropsWithChildren & JustifyContentProp) =>
    <div className={'dfv jc-'+(props.jc ?? 'start')}>{props.children}</div>;