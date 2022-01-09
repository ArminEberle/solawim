export type StaticData = {
    app: {
        pos: {[key: string]: {
            name: string;
            address: string;
        }};
        products: {[key: string]: {
            price: number;
            target: number;
        }}
    };
    userName: string;
};