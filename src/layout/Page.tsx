import React from 'react';
import type { JustifyContentProp } from 'src/layout/types/JustifyContentProp';
import { Vertical } from 'src/layout/Vertical';

export const Page = (props: React.PropsWithChildren & JustifyContentProp) =>
    <div><Vertical jc={props.jc}>{props.children}</Vertical></div>;