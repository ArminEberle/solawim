import type { ChangeEventHandler, FocusEventHandler, ReactEventHandler } from 'react';

export type FormInputBaseProps<IT extends HTMLElement = HTMLInputElement, VT = string> = {
    name?: string;
    value?: VT;
    onChange?: ChangeEventHandler<IT>;
    onBlur?: FocusEventHandler<IT>;
    onLoad?: ReactEventHandler<IT>;
    required?: boolean;
    disabled?: boolean;
    validator?: (value: string) => string | null;
};