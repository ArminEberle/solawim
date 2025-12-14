import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { DataElement } from 'src/atoms/DataElement';

describe('DataElement', () => {
    test('renders label and children', () => {
        render(
            <DataElement label="Label">
                <span>Value</span>
            </DataElement>,
        );
        expect(screen.getByText('Label')).toBeInTheDocument();
        expect(screen.getByText('Value')).toBeInTheDocument();
    });
});
