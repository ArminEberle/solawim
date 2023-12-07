import { createContext } from "react";

// export type SeasonContextType = {
//     season?: number;
//     setSeason?: (season: number) => void;
// }

export const SeasonContext = createContext<number>(2024);

// export const SeasonScope