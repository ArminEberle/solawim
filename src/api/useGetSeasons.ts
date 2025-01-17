import isEqual from 'lodash.isequal';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import {
    useQuery,
} from '@tanstack/react-query'
import { has } from 'src/utils/has';

export const getSeasons = async (): Promise<number[]> => {
    const serverResult = await getJsonBody(await fetch(apiBaseUrl + 'seasons'));
    if (isEqual(serverResult, {})) {
        return [];
    }
    return serverResult;
}

export const useGetSeasons = () => {
    return useQuery({
        queryKey: ['seasons'],
        queryFn: getSeasons,
        initialData: [new Date().getFullYear()]
    })
}

export const useGetCurrentSeason = (): number => {
    const seasons = useGetSeasons().data;
    let season: number;
    if(has(seasons) && seasons.length > 0) {
        season = seasons[seasons.length - 1];
    } else {
        season = new Date().getFullYear();
    }
    return season;
}

