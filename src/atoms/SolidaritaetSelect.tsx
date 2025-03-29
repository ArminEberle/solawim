import React from 'react';
import { Select } from 'src/atoms/Select';
import type { FormInputBaseProps } from 'src/atoms/types/FormInputBaseProps';

export const SolidaritaetSelect = (props: FormInputBaseProps<HTMLSelectElement>) => {
    return (
        <Select
            label="Solidarbeitrag"
            maxWidth={15}
            defaultValue="0"
            options={[
                {
                    display: '2/6 reduzierten',
                    value: '-2',
                },
                {
                    display: '1/6 reduzierten',
                    value: '-1',
                },
                {
                    display: 'normalen',
                    value: '0',
                },
                {
                    display: '1/6 solidarisch erhöhten',
                    value: '1',
                },
                {
                    display: '2/6 solidarisch erhöhten',
                    value: '2',
                },
            ]}
            {...props}
        />
    );
};
