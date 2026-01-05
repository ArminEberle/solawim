import 'src/atoms/Output.css';
import type { CSSProperties } from 'react';

export type OutputProps = {
    label: string;
    value: string | number;
    style?: CSSProperties;
    // children?: ReactNode | undefined;
};
export const Output = (props: OutputProps) => {
    return (
        <div
            className="output-wrapper"
            style={props.style}
        >
            <div className="output-label">{props.label}</div>
            <div className="output-content">{props.value}</div>
        </div>
    );
};
