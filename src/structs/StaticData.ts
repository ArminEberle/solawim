export type StaticData = {
    pos: {[key: string]: {
        name: string;
        address: string;
    }};
    products: {[key: string]: {
        price: number;
        target: number;
    }}
};