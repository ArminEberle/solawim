import { execSync } from 'child_process';
import type { Task } from 'src/build/types/Task';

export default {
    action: (name: string) => {
        execSync('yarn typescript-json-schema src/members/types/MemberData.ts MemberData -o php/api/member-data-schema.json');
    },
    desc: 'Generates the MemberData JSON Schema vor server side validation.',
} as Task;