import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
import { PropsWithChildren } from "react"
import { SeasonContext } from "src/contexts/SeasonContext"

export type RootContextProps = PropsWithChildren & {}

export const RootContext = (props: RootContextProps) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
            },
        },
    });

    const [season, setSeason] = useState<number | undefined>(undefined);

    return <QueryClientProvider client={queryClient}>
        <SeasonContext.Provider value={{
            season,
            setSeason
        }}>
            {props.children}
        </SeasonContext.Provider>
    </QueryClientProvider>;
}