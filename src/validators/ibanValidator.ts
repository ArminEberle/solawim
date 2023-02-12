import { electronicFormatIBAN, isValidIBAN } from 'ibantools';
import { has } from 'src/utils/has';

export const ibanValidator = (iban: string): string | null => {
    if (!has(iban)) {
        return 'Das Feld ist leer';
    }
    const ibanParsed = electronicFormatIBAN(iban);
    if (ibanParsed === null || !isValidIBAN(ibanParsed)) {
        return 'Das scheint keine gültige IBAN zu sein.';
    }
    return null;
};