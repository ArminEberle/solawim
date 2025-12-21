import { replaceCharsToSepaChars } from 'src/members/utils/replaceCharsToSepaChars';
import { expect, test } from 'vitest';

test('replaceCharsToSepaChars', () => {
    expect(replaceCharsToSepaChars('äÄüÜöÖßá&')).toBe('aeAeueUeoeOessa ');
});
