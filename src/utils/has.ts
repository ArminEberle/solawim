export const has = <T>(value?: T | null | undefined): value is NonNullable<T> =>
    value !== null && typeof value !== 'undefined';
