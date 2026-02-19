import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import { SeasonContext } from 'src/contexts/SeasonContext';
import { useLoggedIn } from 'src/hooks/useLoggedIn';
import type { UserMarketingData } from 'src/types/UserMarketingData';

export async function getAllUserMarketingData(season?: number): Promise<UserMarketingData> {
    try {
        const queryString = season ? '?season=' + season : '';
        const fetchResult = await fetch(apiBaseUrl + 'users-marketing' + queryString);
        return await getJsonBody(fetchResult);
    } catch (e) {
        alert(e);
        return [];
    }
}

const USER_MARKETING_DATA_QK = ['userMarketingData'];

export const useGetAllUserMarketingData = (enabled = false) => {
    const season = useContext(SeasonContext).season;
    const loggedIn = useLoggedIn();

    return useQuery<UserMarketingData>({
        queryKey: [USER_MARKETING_DATA_QK, season, loggedIn],
        initialData: [],
        enabled: enabled && loggedIn,
        queryFn: () => {
            if (loggedIn) {
                return getAllUserMarketingData(season);
            }
            return [];
        },
    });
};
