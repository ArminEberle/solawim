import React, { CSSProperties, ReactNode } from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

type VerticalProps = {
    style?: CSSProperties;
    children?: ReactNode | undefined;
} & JustifyContentProp;

export const Vertical = (props: VerticalProps) =>
    <div className={'dfv jc-' + (props.jc ?? 'start')} style={props.style}>{props.children}</div>;