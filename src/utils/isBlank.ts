import { has } from 'src/utils/has';

export const isBlank = (value: string) => {
    if (!has(value)) {
        return true;
    }
    if (value.trim().length === 0) {
        return true;
    }
    return false;
};
