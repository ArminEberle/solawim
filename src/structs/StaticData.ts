export type Product = {
    price: number;
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