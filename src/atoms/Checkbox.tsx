import '/src/atoms/Checkbox.css';

import React, { useRef } from 'react';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
import {RxTriangleDown, RxTriangleRight} from 'react-icons/rx';

export type CheckboxOptions = {
    negate?: boolean;
    kind?: 'normal' | 'tree';
    className?: string;
} &
FormInputBaseProps<HTMLInputElement, boolean>
& React.PropsWithChildren;

export const Checkbox = (props: CheckboxOptions) => {
    let className = props.kind === 'tree' ? 'checkbox tree' : 'checkbox';
    if(props.className) {
        className = className + ' ' + props.className;
    }
    const ref = useRef<HTMLInputElement>(null);
    const isChecked = props.negate ? !ref.current?.checked : ref.current?.checked;
    return <div className={className} onClick={event => {
        if (event.target === ref.current) {
            return;
        }
        event.stopPropagation();
        ref.current?.click();
    }}>
        <input type="checkbox"
            name={props.name}
            checked={props.negate ? !props.value : props.value}
            onChange={(event) => {
                if (props.negate) {
                    event.target.checked = !event.target.checked;
                }
                props?.onChange?.(event);
            }}
            ref={ref}
            onBlur={(event) => {
                if (props.negate) {
                    event.target.checked = !event.target.checked;
                }
                props?.onBlur?.(event);
            }}
            className="i"
            onLoad={props.onLoad}
        />
        {
            props.kind === 'tree' &&
                ( isChecked 
                    ? <RxTriangleDown/>
                    : <RxTriangleRight/>
                )
        }
        <div>
            {props.children}
        </div>
    </div>;
};