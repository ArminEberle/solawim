import 'src/molecules/CollapsibleSection.css';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Checkbox } from 'src/atoms/Checkbox';

export type CollapsibleSectionProps = {
    // collapsed?: boolean;
    stateHandler?: [boolean | undefined, (collapsed: boolean) => void | undefined];
    // onChange?: (collapsed: boolean) => void;
    children?: ReactNode | undefined;
    title: ReactNode;
    initiallyCollapsed?: boolean;
    titleClassName?: string;
};

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
    const privateStateHandler = useState(props.initiallyCollapsed ?? false);
    const stateHandler = props.stateHandler ?? privateStateHandler;
    const [collapsed, setCollapsed] = stateHandler;
    const titleClassName = ['collapsible-section-title', props.titleClassName].filter(Boolean).join(' ');
    return (
        <div>
            <h3 className={titleClassName}>
                <Checkbox
                    value={!collapsed}
                    kind="tree"
                    onChange={e => {
                        const collapsed = !e.target.checked;
                        setCollapsed(collapsed);
                        props.stateHandler?.[1]?.(collapsed);
                    }}
                >
                    {props.title}
                </Checkbox>
            </h3>
            {!collapsed && props.children}
        </div>
    );
};
