import { MemberData } from 'src/members/types/MemberData';

export type SingleMemberData = {
    /**
     * User ID in wordpress database
     */
    id: string;
    user_nicename: string;
    /**
     * The Wordpress user's email address
     */
    user_email: string;
    /**
     * Our custom membership data
     */
    membership?: MemberData;
};

export type SingleMemberHistoryData = SingleMemberData & {
    createdAt: string;
    createdBy: string;
    changes: ChangeEntry[];
};

export type ChangeEntry = {
    field: string;
    old: string;
    new: string;
};

export type AllMembersData = SingleMemberData[];

export type AllMembersHistoryData = SingleMemberHistoryData[];
