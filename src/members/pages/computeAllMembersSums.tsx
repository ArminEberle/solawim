import { AllMembersData } from 'src/members/types/AllMembersData';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { has } from 'src/utils/has';
import { prices } from 'src/utils/prices';
import { emptyOverallSumState } from './emptyOverallSumState';

export function computeAllMembersSums(allMembers: AllMembersData, season: number) {
    const newSumState = emptyOverallSumState();
    for (const member of allMembers) {
        if (!member.membership?.member) {
            continue;
        }
        const membership = member.membership;
        const abholraum = member.membership.abholraum;
        if (!has(abholraum)) {
            console.log('Kein Abholraum festgelegt für Mitglied ' + member.user_nicename);
            continue;
        }

        const fleischCount = Number.parseInt(membership?.fleischMenge) ?? 0;
        newSumState.total.fleisch.count += fleischCount;
        newSumState[abholraum].fleisch.count += fleischCount;
        const fleischSum = calculatePositionSum({
            solidar: membership.fleischSolidar,
            price: prices[season].fleisch,
            amount: membership.fleischMenge,
        });
        newSumState.total.fleisch.sum += fleischSum;
        newSumState[abholraum].fleisch.sum += fleischSum;
        if (fleischSum > 0) {
            newSumState.total.fleisch.accountCount += 1;
            newSumState[abholraum].fleisch.accountCount += 1;
        }
        const fleischSolidar = Number.parseInt(membership.fleischSolidar);
        if (fleischSolidar !== 0) {
            const solidarFactor = Math.abs(fleischSolidar);
            if (fleischSolidar < 0) {
                newSumState.total.fleisch.reduziert += solidarFactor * fleischCount;
                newSumState[abholraum].fleisch.reduziert += solidarFactor * fleischCount;
            } else {
                newSumState.total.fleisch.solidar += solidarFactor * fleischCount;
                newSumState[abholraum].fleisch.solidar += solidarFactor * fleischCount;
            }
        }

        const milchCount = Number.parseInt(membership?.milchMenge ?? '0') ?? 0;
        newSumState.total.milch.count += milchCount;
        newSumState[abholraum].milch.count += milchCount;
        const milchSum = calculatePositionSum({
            solidar: membership.milchSolidar,
            price: prices[season].milch,
            amount: membership.milchMenge,
        });
        newSumState.total.milch.sum += milchSum;
        newSumState[abholraum].milch.sum += milchSum;
        if (milchSum > 0) {
            newSumState.total.milch.accountCount += 1;
            newSumState[abholraum].milch.accountCount += 1;
        }
        const milchSolidar = Number.parseInt(membership.milchSolidar ?? '0');
        if (milchSolidar !== 0) {
            const solidarFactor = Math.abs(milchSolidar);
            if (milchSolidar < 0) {
                newSumState.total.milch.reduziert += solidarFactor * milchCount;
                newSumState[abholraum].milch.reduziert += solidarFactor * milchCount;
            } else {
                newSumState.total.milch.solidar += solidarFactor * milchCount;
                newSumState[abholraum].milch.solidar += solidarFactor * milchCount;
            }
        }

        const brotCount = Number.parseInt(membership?.brotMenge) ?? 0;
        newSumState.total.brot.count += brotCount;
        newSumState[abholraum].brot.count += brotCount;
        const brotSum = calculatePositionSum({
            solidar: membership.brotSolidar,
            price: prices[season].brot,
            amount: membership.brotMenge,
        });
        newSumState.total.brot.sum += brotSum;
        newSumState[abholraum].brot.sum += brotSum;
        if (brotSum > 0) {
            newSumState.total.brot.accountCount += 1;
            newSumState[abholraum].brot.accountCount += 1;
        }
        const brotSolidar = Number.parseInt(membership.brotSolidar);
        if (brotSolidar !== 0) {
            const solidarFactor = Math.abs(brotSolidar);
            if (brotSolidar < 0) {
                newSumState.total.brot.reduziert += solidarFactor * brotCount;
                newSumState[abholraum].brot.reduziert += solidarFactor * brotCount;
            } else {
                newSumState.total.brot.solidar += solidarFactor * brotCount;
                newSumState[abholraum].brot.solidar += solidarFactor * brotCount;
            }
        }

        const veggieCount = Number.parseInt(membership?.veggieMenge) ?? 0;
        newSumState.total.veggie.count += veggieCount;
        newSumState[abholraum].veggie.count += veggieCount;
        const veggieSum = calculatePositionSum({
            solidar: membership.veggieSolidar,
            price: prices[season].veggie,
            amount: membership.veggieMenge,
        });
        newSumState.total.veggie.sum += veggieSum;
        newSumState[abholraum].veggie.sum += veggieSum;
        if (veggieSum > 0) {
            newSumState.total.veggie.accountCount += 1;
            newSumState[abholraum].veggie.accountCount += 1;
        }
        const veggieSolidar = Number.parseInt(membership.veggieSolidar);
        if (veggieSolidar !== 0) {
            const solidarFactor = Math.abs(veggieSolidar);
            if (veggieSolidar < 0) {
                newSumState.total.veggie.reduziert += solidarFactor * veggieCount;
                newSumState[abholraum].veggie.reduziert += solidarFactor * veggieCount;
            } else {
                newSumState.total.veggie.solidar += solidarFactor * veggieCount;
                newSumState[abholraum].veggie.solidar += solidarFactor * veggieCount;
            }
        }
        const total = fleischSum + milchSum + brotSum + veggieSum;
        newSumState.total.totalSum += total;
        newSumState[abholraum].totalSum += total;
        if (total > 0) {
            newSumState.total.members += 1;
            newSumState[abholraum].members += 1;
        }
    }
    return newSumState;
}
