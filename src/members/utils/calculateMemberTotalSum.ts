import { MemberData } from "src/members/types/MemberData";
import { calculatePositionSum } from "src/members/utils/calculatePositionSum";
import { prices } from "src/utils/prices";

export function calculateMemberTotalSum(member: MemberData | null): number {
    if(!member?.member) {
        return 0;
    }
    return calculatePositionSum({
        amount: member.brotMenge,
        solidar: member.brotSolidar,
        price: prices.brot,
    }) 
    + calculatePositionSum({
        amount: member.veggieMenge,
        solidar: member.veggieSolidar,
        price: prices.veggie,
    }) 
    + calculatePositionSum({
        amount: member.fleischMenge,
        solidar: member.fleischSolidar,
        price: prices.fleisch,
    }) 
}