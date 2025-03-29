import React, { CSSProperties, ReactNode } from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export type VerticalProps = {
    style?: CSSProperties;
    children?: ReactNode | undefined;
    className?: string;
} & JustifyContentProp;

export const Vertical = (props: VerticalProps) => (
    <div
        className={'dfv jc-' + (props.jc ?? 'start') + ' ' + (props.className ?? '')}
        style={props.style}
    >
        {props.children}
    </div>
);
