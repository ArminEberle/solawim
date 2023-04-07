export const replaceCharsToSepaChars = (text: String): string => {
    return text.replace(/ä/g, 'ae')
               .replace(/Ä/g, 'Ae')
               .replace(/ü/g, 'ue')
               .replace(/Ü/g, 'Ue')
               .replace(/ö/g, 'oe')
               .replace(/Ö/g, 'Oe')
               .replace(/ß/g, 'ss')
               .replace(/[^a-zA-Z0-9\/\?\:\(\)\.,'\+-]/g, ' ')
}