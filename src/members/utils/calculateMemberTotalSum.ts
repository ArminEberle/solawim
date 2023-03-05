import { SingleMemberData } from "src/members/types/AllMembersData";
import { calculatePositionSum } from "src/members/utils/calculatePositionSum";
import { prices } from "src/utils/prices";

export function calculateMemberTotalSum(member: SingleMemberData): number {
    if(!member.membership?.member) {
        return 0;
    }
    return calculatePositionSum({
        amount: member.membership.brotMenge,
        solidar: member.membership.brotSolidar,
        price: prices.brot,
    }) 
    + calculatePositionSum({
        amount: member.membership.veggieMenge,
        solidar: member.membership.veggieSolidar,
        price: prices.veggie,
    }) 
    + calculatePositionSum({
        amount: member.membership.fleischMenge,
        solidar: member.membership.fleischSolidar,
        price: prices.fleisch,
    }) 
}