import { MembershipData } from './MembershipData';
import { PersonData } from './PersonData';
import { SepaData } from './SepaData';

export type AllMembersData = {
    id: string;
    user_nicename: string;
    user_email: string;
    membership?: MembershipData;
    person?: PersonData;
    sepa?: SepaData;
}[];