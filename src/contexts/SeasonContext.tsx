import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";

export type SeasonContextType = {
    season?: number;
    setSeason?: (season: number) => void;
}

export const SeasonContext = createContext<SeasonContextType>({
    season: 2024,
    setSeason: undefined,
});

export const SeasonScope = (props: PropsWithChildren) => {
    const [season, setSeason] = useState(2024);
    const seasonContextMemo = useMemo(() => ({
        season,
        setSeason,
    }), [season, setSeason]);
    return <SeasonContext.Provider value={seasonContextMemo}>
        {props.children}
    </SeasonContext.Provider>;
}