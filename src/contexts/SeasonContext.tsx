import { createContext } from "react";

export type SeasonContextType = {
    season?: number;
    setSeason?: (season: number) => void;
}

export const SeasonContext = createContext<SeasonContextType>({});