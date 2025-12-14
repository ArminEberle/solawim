import { expect, test } from 'vitest';
import { findNextRemittanceDate } from 'src/utils/findNextRemittanceDate';
import { toDayIsoString } from 'src/utils/toDayIsoString';

test('findNextRemittanceDate', () => {
    expect(toDayIsoString(findNextRemittanceDate(0, new Date(Date.parse('2023-01-01'))))).toBe('2023-01-02');
    expect(toDayIsoString(findNextRemittanceDate(1, new Date(Date.parse('2023-01-01'))))).toBe('2023-01-03');
    expect(toDayIsoString(findNextRemittanceDate(5, new Date(Date.parse('2023-01-01'))))).toBe('2023-01-10');
});
