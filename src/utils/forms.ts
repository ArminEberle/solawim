import type React from 'react';
import type {
    ChangeEvent,
    ChangeEventHandler,
    FocusEvent,
    FocusEventHandler,
    FormEvent,
    FormEventHandler
} from 'react';
import {
    useState
} from 'react';

export type FormMeOptions<T> = {
    data: T;
    onSubmit?: (data: T, setState: (data: T) => void) => unknown;
};

export type FormMeReturn<T> = {
    register: <K extends keyof T>(propName: K,
        valueTransformer?: ((value: T[K]) => T[K])) =>
    {
        value: T[K];
        onChange: ChangeEventHandler;
        onBlur: FocusEventHandler;
        name: string,
    },
    handleSubmit: FormEventHandler;
    state: T,
    setState: React.Dispatch<React.SetStateAction<T>>,
};

export const formMe = <T>(options: FormMeOptions<T>): FormMeReturn<T> => {
    const [stateData, setStateData] = useState(options.data);

    return {
        register: <K extends keyof T>(propName: K,
            valueTransformer?: ((value: T[K]) => T[K])) => {
            return {
                value: stateData[propName],
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    const target = event.target;
                    const newValue = target.type === 'checkbox' ? target.checked : target.value;
                    const newState = Object.assign({}, stateData);
                    newState[propName] = newValue as any;
                    setStateData(newState);
                },
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    const target = event.target;
                    let newValue = target.type === 'checkbox' ? target.checked : target.value;
                    newValue = (valueTransformer?.(newValue as T[K]) as string | boolean) ?? newValue;
                    const newState = Object.assign({}, stateData);
                    newState[propName] = newValue as any;
                    setStateData(newState);
                },
                name: propName,
            };
        },
        handleSubmit: (event: FormEvent) => {
            event.preventDefault();
            const form: HTMLFormElement = event.target as HTMLFormElement;
            const valid = form.checkValidity();
            if (!valid) {
                return;
            }
            options.onSubmit?.({ ...stateData }, setStateData) ;
        },
        state: stateData,
        setState: setStateData,
    };
};