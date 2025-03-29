import React from 'react';
import { Button } from 'src/atoms/Button';
import type { ButtonStyleProp } from 'src/atoms/types/ButtonStyleProp';
import type { HrefProp } from 'src/atoms/types/HrefProp';
import type { TabIndexProp } from 'src/atoms/types/TabIndexProp';

export type ButtonLinkOptions = React.PropsWithChildren & ButtonStyleProp & HrefProp & TabIndexProp;

export const ButtonLink = (options: ButtonLinkOptions) => (
    <Button
        buttonType={options.buttonType}
        onClick={() => (window.location.href = options.href)}
        tabIndex={options.tabIndex}
    >
        {options.children}
    </Button>
);
