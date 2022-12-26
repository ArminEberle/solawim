export type Product = {
    price: number;
    // how many orders we want to have
    target: number;
};

export type Pos = {
    name: string;
    address: string;
};

export type StaticData = {
    userName: string;
    app: {
        pos: {[key: string]: Pos};
        products: {
            bread: Product;
            meat: Product;
        }
    };
};