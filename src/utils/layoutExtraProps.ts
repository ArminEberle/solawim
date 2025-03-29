import type { LayoutExtraProps } from 'src/atoms/types/LayoutExtraProps';
import { has } from 'src/utils/has';

export const layoutExtraProps = (props: LayoutExtraProps) => {
    if (has(props.maxWidth)) {
        return {
            className: 'max-w-' + props.maxWidth,
        };
    }
    return {};
};
