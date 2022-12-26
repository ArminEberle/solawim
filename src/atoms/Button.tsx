import React from 'react';
import { ButtonStyleProp } from 'src/atoms/types/ButtonStyleProp';
import { OnClickProp } from 'src/atoms/types/OnClickProp';
import './Button.css';

export default (props: React.PropsWithChildren 
    & ButtonStyleProp
    & OnClickProp 
) =>
<button 
    // className={'pure-button pure-button-' + props.style} 
    className="btn" 
    onClick={props.onClick}
>
    {props.children}
</button>