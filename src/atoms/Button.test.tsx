import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Button } from 'src/atoms/Button';

describe('Button', () => {
    test('invokes click handler', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
