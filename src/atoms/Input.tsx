
import type { ChangeEvent, FocusEvent, ReactElement } from 'react';
import React, { useRef } from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
import type { LayoutExtraProps } from 'src/atoms/types/LayoutExtraProps';
import { layoutExtraProps } from 'src/utils/layoutExtraProps';

export type InputProps = {
    label: string;
    maxlen: number;
    minlen?: number;
    width?: number;
    autocomplete?: 'username'
    | 'password'
    | 'given-name'
    | 'family-name'
    | 'street-address'
    | 'postal-code'
    | 'city'
    | 'address-level2'
    | 'tel'
    | 'payee-account-number'
    | 'payee-bank-code'
    | 'cc-type'
    | 'cc-name'
    ;
} & FormInputBaseProps
& LayoutExtraProps;

export const Input = (options: InputProps):ReactElement => {
    // if (!has(options.value)) {
    //     throw new Error('value not set');
    // }

    const myRef = useRef<HTMLInputElement>(null);
    const disabled = options.disabled ?? false;
    const required = !disabled && (options.required ?? false);

    const validate = (value: string) => {
        const myElem = myRef.current;
        myElem?.setCustomValidity('');
        if (!myElem?.validity.valid) {
            return;
        }
        if (options.validator) {
            myElem?.setCustomValidity(options.validator?.(value) ?? '');
        }
    };
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        options.onChange?.(event);
        validate(event.target.value);
    };
    const onBlur = (event: FocusEvent<HTMLInputElement>) => {
        event.target.value = event.target.value.trim();
        options.onBlur?.(event);
        validate(event.target.value);
    };

    const result = <div className="input-wrapper" {...layoutExtraProps(options)}>
        <label className="control-label">{options.label}</label>
        <input type="text"
            className="form-control"
            name={options.name}
            placeholder={options.label}
            maxLength={options.maxlen}
            minLength={options.minlen}
            autoComplete={options.autocomplete}
            value={options.value}
            onChange={onChange}
            onBlur={onBlur}
            onLoad={options.onLoad}
            width={options.width}
            required={required}
            disabled={disabled}
            style={options.style}
            ref={myRef} />
    </div>;
    return result;
};