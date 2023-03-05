import '/src/atoms/Checkbox.css';

import React, { useRef } from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
import {RxTriangleDown, RxTriangleRight} from 'react-icons/rx';

export type CheckboxOptions = {
    negate?: boolean;
    kind?: 'normal' | 'tree';
} &
FormInputBaseProps<HTMLInputElement, boolean>
& React.PropsWithChildren;

export const Checkbox = (options: CheckboxOptions) => {
    const className = options.kind === 'tree' ? 'checkbox tree' : 'checkbox'
    const ref = useRef<HTMLInputElement>(null);
    const isChecked = options.negate ? !ref.current?.checked : ref.current?.checked;
    return <div className={className} onClick={event => {
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
        {
            options.kind === 'tree' &&
                ( isChecked 
                    ? <RxTriangleDown/>
                    : <RxTriangleRight/>
                )
        }
        <div>
            {options.children}
        </div>
    </div>;
};