import 'src/atoms/Checkbox.css';

import { useRef } from 'react';
import type { PropsWithChildren } from 'react';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { RxTriangleDown, RxTriangleRight } from 'react-icons/rx';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';
export type CheckboxOptions = {
    negate?: boolean;
    kind?: 'normal' | 'tree' | 'toggle';
    className?: string;
} & FormInputBaseProps<HTMLInputElement, boolean> &
    PropsWithChildren;

export const Checkbox = (props: CheckboxOptions) => {
    let className = 'checkbox';
    if (props.kind === 'tree') {
        className += ' tree custom';
    }
    if (props.kind === 'toggle') {
        className += ' toggle custom';
    }
    if (props.className) {
        className = className + ' ' + props.className;
    }
    const ref = useRef<HTMLInputElement>(null);
    const isChecked = props.negate ? !ref.current?.checked : ref.current?.checked;
    return (
        <div
            className={className}
            onClick={event => {
                if (event.target === ref.current) {
                    return;
                }
                event.stopPropagation();
                ref.current?.click();
            }}
        >
            <input
                type="checkbox"
                name={props.name}
                checked={props.negate ? !props.value : props.value}
                onChange={event => {
                    if (props.negate) {
                        event.target.checked = !event.target.checked;
                    }
                    props?.onChange?.(event);
                }}
                ref={ref}
                onBlur={event => {
                    if (props.negate) {
                        event.target.checked = !event.target.checked;
                    }
                    props?.onBlur?.(event);
                }}
                className="i"
                onLoad={props.onLoad}
            />
            {props.kind === 'tree' && (isChecked ? <RxTriangleDown /> : <RxTriangleRight />)}
            {props.kind === 'toggle' && (isChecked ? <BsToggleOn /> : <BsToggleOff />)}
            <div>{props.children}</div>
        </div>
    );
};
