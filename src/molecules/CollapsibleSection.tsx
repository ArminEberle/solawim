import React from "react";
import { ReactNode, useState } from "react"
import { Checkbox } from "src/atoms/Checkbox";

export type CollapsibleSectionProps = {
    collapsed?: boolean;
    children?: ReactNode | undefined;
    title: string;
}

export const CollapsibleSection = (props: CollapsibleSectionProps) => {
    const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
    return <div>
        <h3>
        <Checkbox value={!collapsed} 
                  kind="tree"
                  onChange={e => setCollapsed(!e.target.checked)}>
            {props.title}
        </Checkbox>
        </h3>
        {!collapsed && props.children}
    </div>;
}