import { execSync } from 'child_process';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: (name: string) => {
        console.log(name);
        const baseCommand = 'yarn typescript-json-schema tsconfig.json';
        execSync(
            `${baseCommand} MemberData --include src/members/types/MemberData.ts -o php/api/member-data-schema.json`,
        );
        execSync(
            `${baseCommand} MemberDataAdmin --include src/members/types/MemberDataAdmin.ts -o php/api/member-data-admin-schema.json`,
        );
        execSync(
            `${baseCommand} BankingData --include src/members/types/BankingData.ts -o php/api/banking-data-schema.json`,
        );
        execSync(`${baseCommand} EmailData --include src/types/EmailData.ts -o php/api/email-data-schema.json`);
    },
} satisfies BuildTask;
