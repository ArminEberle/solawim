import React from 'react';
import { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export default (props: React.PropsWithChildren & JustifyContentProp) =>
    <div className={'dfh jc-'+(props.jc ?? 'center')}>{props.children}</div>;