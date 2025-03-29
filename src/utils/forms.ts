import type React from 'react';
import type {
    ChangeEvent,
    ChangeEventHandler,
    FocusEvent,
    FocusEventHandler,
    FormEvent,
    FormEventHandler,
} from 'react';
import { useState } from 'react';

export type FormMeOptions<T extends Record<string, unknown>> = {
    data: T;
    onSubmit?: (data: T, setState: (data: T) => void) => unknown;
    watch?: WatchCallback<T>;
};

/**
 * The watch transform. After every form change, this is called with the complete form data.
 * If it returns a value, this will be taken instead of the given form data.
 * But you can also just return undefined and modify the value instead.
 */
export type WatchCallback<T extends Record<string, unknown>> = (formdata: T) => T | undefined | void;

export type FormMeReturn<T extends Record<string, unknown>> = {
    register: <K extends keyof T>(
        propName: K,
        valueTransformer?: (value: T[K]) => T[K],
    ) => {
        value: T[K];
        onChange: ChangeEventHandler;
        onBlur: FocusEventHandler;
        name: string;
    };
    handleSubmit: FormEventHandler;
    state: T;
    setState: React.Dispatch<React.SetStateAction<T>>;
};

export const formMe = <T extends Record<string, unknown>>(options: FormMeOptions<T>): FormMeReturn<T> => {
    const [stateData, setStateData] = useState(options.data);
    const { watch } = options;

    return {
        register: <K extends keyof T>(propName: K, valueTransformer?: (value: T[K]) => T[K]) => {
            return {
                value: stateData[propName],
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    const target = event.target;
                    const newValue = target.type === 'checkbox' ? target.checked : target.value;
                    const newState = Object.assign({}, stateData);
                    newState[propName] = newValue as any;
                    const watchTransformed = watch?.(newState) ?? newState;
                    setStateData(watchTransformed);
                },
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    const target = event.target;
                    let newValue = target.type === 'checkbox' ? target.checked : target.value;
                    newValue = (valueTransformer?.(newValue as T[K]) as string | boolean) ?? newValue;
                    const newState = Object.assign({}, stateData);
                    const watchTransformed = watch?.(newState) ?? newState;
                    setStateData(watchTransformed);
                },
                name: propName as string,
            };
        },
        handleSubmit: (event: FormEvent) => {
            event.preventDefault();
            const form: HTMLFormElement = event.target as HTMLFormElement;
            const valid = form.checkValidity();
            if (!valid) {
                return;
            }
            options.onSubmit?.({ ...stateData }, setStateData);
        },
        state: stateData,
        setState: setStateData,
    };
};
