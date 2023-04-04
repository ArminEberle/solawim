import './DataElement.css';
import React from 'react';
import { ReactNode } from 'react';
import { Horizontal } from 'src/layout/Horizontal';

export type DataElementProps = {
    label: string;
    className?: string;
    children?: ReactNode | undefined;
};

export const DataElement = (props: DataElementProps) => 
<Horizontal className={'dl-el ' +(props.className ?? '')}>
    <div className="dl-el-la">{props.label}</div>
    {props.children}
</Horizontal> 