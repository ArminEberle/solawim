import React, { useContext } from 'react';
import { useGetSeasons } from "src/api/useGetSeasons";
import { SeasonContext } from 'src/contexts/SeasonContext';

export type SeasonSelectProps = {
    name?: string;
    onSeasonSelect?: (season: number) => void;
}

export const useSeason = (): number => {
    return useContext(SeasonContext).season;
}

export const SeasonSelect = (props: SeasonSelectProps) => {
    const seasonsQuery = useGetSeasons();
    const seasonContext = useContext(SeasonContext);
    return <>
        {seasonsQuery.isFetched && (
            <select name={props.name}
                onChange={(event) => seasonContext.setSeason?.(Number.parseInt(event.target.value))}
                value={seasonContext.season}
            >
                {seasonsQuery.data?.map((season) => <option
                    key={season}
                    value={season} 
                    // {...(seasonContext.season === season) ? { selected: true } : {}}
                >{season}</option>)}
            </select>
        )}
        {!seasonsQuery.isFetched && (
            <div>Lade Daten...</div>
        )}
    </>
}