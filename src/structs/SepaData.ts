export type SepaData = {
    iban: string;
    bank: string;
    bic: string;
    name: string;
    street: string;
    zip: number | null;
    city: string;
};