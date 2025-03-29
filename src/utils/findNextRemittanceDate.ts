import { isBankWorkDay } from 'src/utils/isBankWorkDay';

export const findNextRemittanceDate = (daysOff: number, relativeTo: Date): Date => {
    const result = new Date(relativeTo.getTime());
    // firstly move to then next banking day
    while (!isBankWorkDay(result)) {
        incrementDateByOne(result);
    }
    // now move the days foward as indicated
    while (daysOff > 0) {
        incrementDateByOne(result);
        if (isBankWorkDay(result)) {
            daysOff--;
        }
    }
    return result;
};

const incrementDateByOne = (date: Date) => {
    date.setDate(date.getDate() + 1);
};
