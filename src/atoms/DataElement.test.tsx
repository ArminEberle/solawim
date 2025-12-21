import { render, screen } from '@testing-library/react';
import { DataElement } from 'src/atoms/DataElement';
import { describe, expect, test } from 'vitest';

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
