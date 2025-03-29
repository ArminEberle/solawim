import './Button.css';
// import '/src/atoms/Button.css';

import React, { CSSProperties } from 'react';
import type { ButtonStyleProp } from 'src/atoms/types/ButtonStyleProp';
import type { OnClickProp } from 'src/atoms/types/OnClickProp';
import type { TabIndexProp } from 'src/atoms/types/TabIndexProp';

export type ButtonProps = React.PropsWithChildren &
    ButtonStyleProp &
    OnClickProp & {
        type?: 'submit';
        disabled?: boolean;
        style?: CSSProperties;
    } & TabIndexProp;

export const Button = (props: ButtonProps): JSX.Element => (
    <button
        className="btn"
        tabIndex={props.tabIndex ?? 0}
        onClick={props.onClick}
        disabled={props.disabled ?? false}
        style={props.style}
        {...(props.type ? { type: props.type } : {})}
    >
        {props.children}
    </button>
);
