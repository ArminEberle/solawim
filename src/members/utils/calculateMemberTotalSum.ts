import { MemberData } from 'src/members/types/MemberData';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { prices } from 'src/utils/prices';

export function calculateMemberTotalSum(member: MemberData | null, season: number): number {
    if (!member?.member || member.active) {
        return 0;
    }
    return (
        calculatePositionSum({
            amount: Number.parseInt(member.brotMenge),
            solidar: member.brotSolidar,
            price: prices[season].brot,
        }) +
        calculatePositionSum({
            amount: Number.parseInt(member.veggieMenge),
            solidar: member.veggieSolidar,
            price: prices[season].veggie,
        }) +
        calculatePositionSum({
            amount: Number.parseInt(member.fleischMenge),
            solidar: member.fleischSolidar,
            price: prices[season].fleisch,
        }) +
        calculatePositionSum({
            amount: Number.parseInt(member.milchMenge ?? '0'),
            solidar: member.milchSolidar,
            price: prices[season].milch,
        })
    );
}
