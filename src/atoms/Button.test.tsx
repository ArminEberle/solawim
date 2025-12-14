import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from 'src/atoms/Button';
import { describe, expect, test, vi } from 'vitest';

describe('Button', () => {
    test('invokes click handler', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
