import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import { SeasonContext } from 'src/contexts/SeasonContext';
import { useLoggedIn } from 'src/hooks/useLoggedIn';
import type { AllMembersData } from 'src/members/types/AllMembersData';

export async function getAllMemberData(season?: number): Promise<AllMembersData> {
    let queryString = season ? ('?season=' + season) : ''
    try {
        const fetchResult = await fetch(apiBaseUrl + 'members' + queryString);
        return await getJsonBody(fetchResult);
    } catch (e) {
        alert(e);
        return [];
    }
}

const ALL_MEMBER_DATA_QK = ['allMemberData'];


export const useGetAllMemberData = () => {
    const season = useContext(SeasonContext).season;
    const loggedIn = useLoggedIn();
    // const newState = season + '' + loggedIn;
    // const [state, setState] = useState(newState);
    // const stateChanged = newState !== state;

    return useQuery<AllMembersData>({
        queryKey: [ALL_MEMBER_DATA_QK, season, loggedIn],
        initialData: [],
        queryFn: () => {
            if (loggedIn) {
                return getAllMemberData(season);
            }
            return [];
        },
    })
}