import { expect, test } from 'vitest';
import { replaceCharsToSepaChars } from 'src/members/utils/replaceCharsToSepaChars';

test('replaceCharsToSepaChars', () => {
    expect(replaceCharsToSepaChars('äÄüÜöÖßá&')).toBe('aeAeueUeoeOessa ');
});
