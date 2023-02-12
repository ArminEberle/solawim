import '/src/atoms/Select.css';

import React from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
import type { LayoutExtraProps } from 'src/atoms/types/LayoutExtraProps';
import { layoutExtraProps } from 'src/utils/layoutExtraProps';

export type SelectOption = {
    display?: string;
    value: string | number;
};

export type SelectOptions = FormInputBaseProps<HTMLSelectElement> & {
    options: (SelectOption | string | number)[];
    label?: string;
} & LayoutExtraProps;

export const Select = (options: SelectOptions) => {
    const disabled = options.disabled ?? false;
    const required = !disabled && (options.required ?? false);

    return <div className="input-wrapper" {...layoutExtraProps(options)}>
        <label className="control-label">{options.label}</label>
        <select
            className="form-control"
            name={options.name}
            value={options.value}
            onChange={options.onChange}
            onBlur={options.onBlur}
            required={required}
            disabled={disabled}
        >
            {options.options.map(option => {
                const optionValue = (typeof option === 'string' || typeof option === 'number') ? option : option.value;
                const optionDisplay = (typeof option === 'string' || typeof option === 'number') ? option : option.display ?? option.value;
                return <option value={optionValue} key={optionValue} >
                    {optionDisplay}
                </option>;
            })}
        </select>
    </div>;
};