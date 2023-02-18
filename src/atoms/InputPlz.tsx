
import type { ChangeEventHandler } from 'react';
import React, { useState } from 'react';
import { Input } from 'src/atoms/Input';

export type InputPlzProps = {
    label?: string;
    value: string;
    required?: boolean;
    disabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>
};

const cleanInputString = (input: string) => input.replace(/([^0-9])+/g, '').substring(0, 5);

export const InputPlz = (options: InputPlzProps) => {
    const [value, setValue] = useState(options.value);
    const label = options.label ?? 'PLZ';

    const onChange = (event:any) => {
        const newVal = cleanInputString(event.target.value);
        event.target.value = newVal;
        setValue(newVal);
        options.onChange?.(event);
    };
    const onBlur = (event:any) => {
        let newVal = cleanInputString(event.target.value).padStart(5, '0');
        if (newVal === '00000') {
            newVal = '';
        }
        event.target.value = newVal;
        setValue(newVal);
        options.onChange?.(event);
    };

    return <Input
        label={label}
        maxlen={20}
        width={5}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={options.disabled}
        required={options.required}
        autocomplete="postal-code"
    />;
};