export type OrderType = {
    count: number;
    factor: number;
};

export type MembershipData = {
    lastModified?: string;
    applied: boolean;
    signed: boolean;
    orders: {
        bread: OrderType;
        meat: OrderType;
    };
    pos: string;
};