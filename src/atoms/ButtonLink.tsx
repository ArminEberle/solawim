import React from 'react';
import Button from 'src/atoms/Button';
import { ButtonStyleProp } from 'src/atoms/types/ButtonStyleProp';
import { HrefProp } from 'src/atoms/types/HrefProp';

export default (props: React.PropsWithChildren 
    & ButtonStyleProp
    & HrefProp
) =>
<Button 
    style={props.style} 
    onClick={() => window.location.href = props.href}
>
    {props.children}
</Button>
