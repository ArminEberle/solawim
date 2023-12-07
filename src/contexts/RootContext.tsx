import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
import { PropsWithChildren } from "react"
import { SeasonContext, SeasonScope } from "src/contexts/SeasonContext"

export type RootContextProps = PropsWithChildren & {}

export const RootContext = (props: RootContextProps) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
            },
        },
    });

    return <QueryClientProvider client={queryClient}>
        <SeasonScope>
            {props.children}
        </SeasonScope>
    </QueryClientProvider>;
}