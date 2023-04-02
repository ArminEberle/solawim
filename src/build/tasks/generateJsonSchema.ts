import { execSync } from 'child_process';
import type { Task } from 'src/build/types/Task';

export default {
    action: (name: string) => {
        console.log(name);
        execSync('yarn typescript-json-schema src/members/types/MemberData.ts MemberData -o php/api/member-data-schema.json');
        execSync('yarn typescript-json-schema src/members/types/MemberDataAdmin.ts MemberDataAdmin -o php/api/member-data-admin-schema.json');
        execSync('yarn typescript-json-schema src/members/types/BankingData.ts BankingData -o php/api/banking-data-schema.json');
    },
    desc: 'Generates the MemberData JSON Schema vor server side validation.',
} as Task;