import { Abholraum } from 'src/members/types/MemberData';
import { emptySumState, SumState } from './emptySumState';

export type OverallSumState = {
    total: SumState;
} & {
    hutzelberghof: SumState;
    witzenhausen: SumState;
    gertenbach: SumState;
};

export function emptyOverallSumState(): OverallSumState {
    return {
        total: emptySumState(),
        witzenhausen: emptySumState(),
        gertenbach: emptySumState(),
        hutzelberghof: emptySumState()
    } as { total: SumState; } & {
        [key in Abholraum]: SumState;
    };
}
