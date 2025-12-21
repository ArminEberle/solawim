import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { SeasonScope } from 'src/contexts/SeasonContext';

export type RootContextProps = PropsWithChildren & {};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {},
    },
});

export const RootContext = (props: RootContextProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <SeasonScope>{props.children}</SeasonScope>
        </QueryClientProvider>
    );
};
