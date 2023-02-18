import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { Vertical } from "src/layout/Vertical";
import './Output.css';

export type OutputProps = {
    label: string;
    value: string | number;
    style?: CSSProperties;
    // children?: ReactNode | undefined;
}
export const Output = (props: OutputProps) => {
    <div className="output-wrapper" style={props.style}>
        <div className="control-label">{props.label}</div>
        <div className="output-content">{props.value}</div>
    </div>
}