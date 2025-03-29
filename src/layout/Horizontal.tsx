import React, { CSSProperties, ReactNode } from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export type HorizontalProps = {
    style?: CSSProperties;
    children?: ReactNode | undefined;
    className?: string;
} & JustifyContentProp;

export const Horizontal = (props: HorizontalProps) => (
    <div
        className={'dfh jc-' + (props.jc ?? 'center') + ' ' + (props.className ?? '')}
        style={props.style}
    >
        {props.children}
    </div>
);
