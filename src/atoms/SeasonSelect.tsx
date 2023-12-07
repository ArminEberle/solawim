import React, { useContext } from 'react';
import { useGetSeasons } from "src/api/useGetSeasons";
import { SeasonContext } from 'src/contexts/SeasonContext';

export type SeasonSelectProps = {
    onSeasonSelect?: (season: number) => void;
}

export const SeasonSelect = (props: SeasonSelectProps) => {
    const seasonsQuery = useGetSeasons();
    const seasonContext = useContext(SeasonContext);
    return <>
        {seasonsQuery.isFetched && (
            <select onChange={(event) => seasonContext.setSeason?.(Number.parseInt(event.target.value))}>
                {seasonsQuery.data?.map((season) => <option 
                    value={season} {...(seasonContext.season === season)?{selected: true} : {}} 
                >{season}</option>)}
            </select>
        )}
        {!seasonsQuery.isFetched && (
            <div>Lade Daten...</div>
        )}
    </>
}