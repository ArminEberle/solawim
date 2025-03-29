import React from 'react';
import { ReactNode, useState } from 'react';
import { Checkbox } from 'src/atoms/Checkbox';

export type CollapsibleSectionProps = {
    // collapsed?: boolean;
    stateHandler?: [boolean | undefined, (collapsed: boolean) => void | undefined];
    // onChange?: (collapsed: boolean) => void;
    children?: ReactNode | undefined;
    title: string;
    initiallyCollapsed?: boolean;
};

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
    const privateStateHandler = useState(props.initiallyCollapsed ?? false);
    const stateHandler = props.stateHandler ?? privateStateHandler;
    const [collapsed, setCollapsed] = stateHandler;
    return (
        <div>
            <h3>
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
