import { Abholraum } from 'src/members/types/MemberData';
import { SumState, emptySumState } from './emptySumState';

export type OverallSumState = {
    total: SumState;
} & Record<Abholraum, SumState>;

export const emptyOverallSumState = (): OverallSumState => {
    return {
        total: emptySumState(),
        witzenhausen: emptySumState(),
        gertenbach: emptySumState(),
        hutzelberghof: emptySumState(),
    } as { total: SumState } & {
        [key in Abholraum]: SumState;
    };
};
