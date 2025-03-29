import { expect, test } from '@jest/globals';
import { replaceCharsToSepaChars } from 'src/members/utils/replaceCharsToSepaChars';

test('replaceCharsToSepaChars', () => {
    expect(replaceCharsToSepaChars('äÄüÜöÖßá&')).toBe('aeAeueUeoeOess  ');
});
