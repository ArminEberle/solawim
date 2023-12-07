import isEqual from 'lodash.isequal';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import {
    useQuery,
} from '@tanstack/react-query'

export const getSeasons = async(): Promise<number[]> => {
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
    })
}

