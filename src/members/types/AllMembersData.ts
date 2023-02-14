import { MemberData } from 'src/members/types/MemberData';

export type AllMembersData = {
    id: string;
    user_nicename: string;
    user_email: string;
    membership?: MemberData;
}[];