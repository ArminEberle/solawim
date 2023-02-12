import '/src/atoms/Checkbox.css';

import React, { useRef } from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';

export type CheckboxOptions = {
    negate?: boolean;
} &
FormInputBaseProps<HTMLInputElement, boolean>
& React.PropsWithChildren;

export const Checkbox = (options: CheckboxOptions) => {
    const ref = useRef<HTMLInputElement>(null);
    return <div className="checkbox" onClick={event => {
        if (event.target === ref.current) {
            return;
        }
        event.stopPropagation();
        ref.current?.click();
    }}>
        <input type="checkbox"
            name={options.name}
            checked={options.negate ? !options.value : options.value}
            onChange={(event) => {
                if (options.negate) {
                    event.target.checked = !event.target.checked;
                }
                options?.onChange?.(event);
            }}
            ref={ref}
            onBlur={(event) => {
                if (options.negate) {
                    event.target.checked = !event.target.checked;
                }
                options?.onBlur?.(event);
            }}
            className="i"
            onLoad={options.onLoad}
        />
        <div>
            {options.children}
        </div>
    </div>;
};