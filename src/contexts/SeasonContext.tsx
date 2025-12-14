import { createContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useGetCurrentSeason } from 'src/api/useGetSeasons';

export type SeasonContextType = {
    season: number;
    setSeason?: (season: number) => void;
};

export const SeasonContext = createContext<SeasonContextType>({
    season: 2025,
    setSeason: undefined,
});

export const SeasonScope = (props: PropsWithChildren) => {
    const currentSeason = useGetCurrentSeason();
    const [season, setSeason] = useState(currentSeason);
    const seasonContextMemo = useMemo(
        () => ({
            season,
            setSeason,
        }),
        [season, setSeason],
    );
    return <SeasonContext.Provider value={seasonContextMemo}>{props.children}</SeasonContext.Provider>;
};
