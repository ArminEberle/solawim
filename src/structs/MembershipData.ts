export type MembershipData = {
    lastModified: string;
    applied: boolean;
    signed: boolean;
    orders: {[key: string]: {
        count: number;
        factor: number;
    }};
    pos: string;
};