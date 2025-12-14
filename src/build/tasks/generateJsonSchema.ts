import { execSync } from 'child_process';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (name: string) => {
        console.log(name);
        execSync(
            'yarn typescript-json-schema src/members/types/MemberData.ts MemberData -o php/api/member-data-schema.json',
        );
        execSync(
            'yarn typescript-json-schema src/members/types/MemberDataAdmin.ts MemberDataAdmin -o php/api/member-data-admin-schema.json',
        );
        execSync(
            'yarn typescript-json-schema src/members/types/BankingData.ts BankingData -o php/api/banking-data-schema.json',
        );
        execSync('yarn typescript-json-schema src/types/EmailData.ts EmailData -o php/api/email-data-schema.json');
    },
} satisfies BuildTask;
