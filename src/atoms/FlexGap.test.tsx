import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { FlexGap } from 'src/atoms/FlexGap';

describe('FlexGap', () => {
    test('applies flex grow style', () => {
        const { container } = render(<FlexGap />);
        const gapElement = container.firstElementChild as HTMLElement;
        expect(gapElement).toHaveStyle({ flexGrow: '1' });
    });
});
