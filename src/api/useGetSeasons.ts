import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash.isequal';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import { getCurrentSeason } from 'src/utils/getCurrentSeason';

export const getSeasons = async (): Promise<number[]> => {
    const serverResult = await getJsonBody(await fetch(apiBaseUrl + 'seasons'));
    if (isEqual(serverResult, {})) {
        return [];
    }
    return serverResult;
};

export const useGetSeasons = () => {
    return useQuery({
        queryKey: ['seasons'],
        queryFn: getSeasons,
        refetchInterval: 24 * 60 * 60 * 1000, // refetch every 24 hours
        initialData: [getCurrentSeason()],
    });
};

export const useGetCurrentSeason = (): number => {
    const seasons = useGetSeasons().data;
    const computedCurrentSeason = getCurrentSeason();
    if (!seasons.includes(computedCurrentSeason) && seasons.length > 0) {
        return seasons[seasons.length - 1];
    }
    return computedCurrentSeason;
};

export const useGetLatestSeason = (): number => {
    const seasons = useGetSeasons().data;
    const computedLatestSeason = new Date().getFullYear();
    if (!seasons.includes(computedLatestSeason) && seasons.length > 0) {
        return seasons[seasons.length - 1];
    }
    return computedLatestSeason;
};
