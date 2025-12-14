import { render } from '@testing-library/react';
import { FlexGap } from 'src/atoms/FlexGap';
import { describe, expect, test } from 'vitest';

describe('FlexGap', () => {
    test('applies flex grow style', () => {
        const { container } = render(<FlexGap />);
        const gapElement = container.firstElementChild as HTMLElement;
        expect(gapElement).toHaveStyle({ flexGrow: '1' });
    });
});
