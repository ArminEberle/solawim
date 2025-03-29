import { MemberData } from 'src/members/types/MemberData';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { prices } from 'src/utils/prices';

export function calculateMemberTotalSum(member: MemberData | null, season: number): number {
    if (!member?.member) {
        return 0;
    }
    return (
        calculatePositionSum({
            amount: member.brotMenge,
            solidar: member.brotSolidar,
            price: prices[season].brot,
        }) +
        calculatePositionSum({
            amount: member.veggieMenge,
            solidar: member.veggieSolidar,
            price: prices[season].veggie,
        }) +
        calculatePositionSum({
            amount: member.fleischMenge,
            solidar: member.fleischSolidar,
            price: prices[season].fleisch,
        }) +
        calculatePositionSum({
            amount: member.milchMenge,
            solidar: member.milchSolidar,
            price: prices[season].milch,
        })
    );
}
