import { MemberData } from 'src/members/types/MemberData';

export type SingleMemberData = {
    id: string;
    user_nicename: string;
    user_email: string;
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
