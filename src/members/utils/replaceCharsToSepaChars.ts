export const replaceCharsToSepaChars = (text: String): string => {
    return text
        .replace(/ä/g, 'ae')
        .replace(/Ä/g, 'Ae')
        .replace(/ü/g, 'ue')
        .replace(/Ü/g, 'Ue')
        .replace(/ö/g, 'oe')
        .replace(/Ö/g, 'Oe')
        .replace(/ß/g, 'ss')
        .replace(/é/g, 'e')
        .replace(/è/g, 'e')
        .replace(/ê/g, 'e')
        .replace(/á/g, 'a')
        .replace(/à/g, 'a')
        .replace(/â/g, 'a')
        .replace(/[^a-zA-Z0-9\/\?\:\(\)\.,'\+-]/g, ' ');
};
