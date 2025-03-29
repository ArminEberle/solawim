// import '/src/atoms/Select.css';
import './Select.css';

import React from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
import type { LayoutExtraProps } from 'src/atoms/types/LayoutExtraProps';
import { has } from 'src/utils/has';
import { layoutExtraProps } from 'src/utils/layoutExtraProps';

export type SelectOption<T extends string | number = string | number> = {
    display?: string;
    value: T;
};

export type SelectProps = FormInputBaseProps<HTMLSelectElement> & {
    options: (SelectOption | string | number)[];
    defaultValue?: string | number;
    label?: string;
    className?: string;
} & LayoutExtraProps;

export const Select = (props: SelectProps) => {
    const disabled = props.disabled ?? false;
    const required = !disabled && (props.required ?? false);

    const selectClassName = `form-control ${props.className ?? ''}`;

    return (
        <div
            className="input-wrapper"
            {...layoutExtraProps(props)}
        >
            <label className="control-label">{props.label}</label>
            <select
                className={selectClassName}
                name={props.name}
                value={props.value ?? ''}
                defaultValue={props.defaultValue ?? ''}
                onChange={props.onChange}
                onBlur={props.onBlur}
                required={required}
                disabled={disabled}
            >
                {props.options.map(option => {
                    const optionValue =
                        typeof option === 'string' || typeof option === 'number' ? option : option.value;
                    const optionDisplay =
                        typeof option === 'string' || typeof option === 'number'
                            ? option
                            : (option.display ?? option.value);
                    return (
                        <option
                            value={optionValue}
                            key={optionValue}
                        >
                            {optionDisplay}
                        </option>
                    );
                })}
                {!has(props.value) && (
                    <option
                        value=""
                        disabled
                    >
                        Bitte wählen
                    </option>
                )}
            </select>
        </div>
    );
};
