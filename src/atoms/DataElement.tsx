import './DataElement.css';
import type { CSSProperties, ReactNode } from 'react';
import { Horizontal } from 'src/layout/Horizontal';

export type DataElementProps = {
    label: string;
    className?: string;
    children?: ReactNode | undefined;
    style?: CSSProperties;
};

export const DataElement = (props: DataElementProps) => (
    <Horizontal
        className={'dl-el ' + (props.className ?? '')}
        style={props.style}
    >
        <div className="dl-el-la">{props.label}</div>
        {props.children}
    </Horizontal>
);
