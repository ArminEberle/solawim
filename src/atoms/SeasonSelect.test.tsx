import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SeasonSelect } from 'src/atoms/SeasonSelect';
import { SeasonContext } from 'src/contexts/SeasonContext';

vi.mock('src/api/useGetSeasons', () => ({
    useGetSeasons: () => ({
        isFetched: true,
        data: [2023, 2024],
    }),
    useGetCurrentSeason: () => 2023,
}));

describe('SeasonSelect', () => {
    test('lists available seasons and notifies context on change', () => {
        const setSeason = vi.fn();
        render(
            <SeasonContext.Provider value={{ season: 2023, setSeason }}>
                <SeasonSelect name="season" />
            </SeasonContext.Provider>,
        );
        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('2023');
        fireEvent.change(select, { target: { value: '2024' } });
        expect(setSeason).toHaveBeenCalledWith(2024);
    });
});
