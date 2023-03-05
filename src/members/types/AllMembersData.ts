import { MemberData } from 'src/members/types/MemberData';

export type SingleMemberData = {
    id: string;
    user_nicename: string;
    user_email: string;
    membership?: MemberData;
};

export type AllMembersData = SingleMemberData[];