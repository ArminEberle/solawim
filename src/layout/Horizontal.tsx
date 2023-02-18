import React, { CSSProperties, ReactNode } from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export type HorizontalProps = {
    style?: CSSProperties;
    children?: ReactNode | undefined;
} & JustifyContentProp;


export const Horizontal = (props: HorizontalProps) =>
    <div className={`dfh jc-${props.jc ?? 'center'}`} style={props.style}>{props.children}</div>;