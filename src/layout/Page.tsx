import type { PropsWithChildren } from 'react';
import { Vertical } from 'src/layout/Vertical';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';

export const Page = (props: PropsWithChildren & JustifyContentProp) => (
    <div>
        <Vertical jc={props.jc}>{props.children}</Vertical>
    </div>
);
