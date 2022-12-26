import React from 'react';
import { JustifyContentProp } from 'src/layout/types/JustifyContentProp';
import Vertical from 'src/layout/Vertical';

export default (props: React.PropsWithChildren & JustifyContentProp) =>
    <article><Vertical jc={props.jc}>{props.children}</Vertical></article>;