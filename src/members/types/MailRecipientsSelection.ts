import type { Abholraum } from 'src/members/types/MemberData';
import { Product } from 'src/members/types/Product';

export type MailRecipientsSelection = {
    abholraeume: Abholraum[];
    products: Product[];
    activeMembers: boolean;
    allMembers: boolean;
};
