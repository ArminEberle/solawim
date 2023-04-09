import { bankHolidays } from "src/utils/bankHolidays";
import { toDayIsoString } from "src/utils/toDayIsoString";

export const isBankWorkDay = (date: Date): boolean => {
    const weekDay = date.getDay(); 
    if(weekDay === 0 || weekDay === 6) {
        return false;
    }
    if(bankHolidays.has(toDayIsoString(date))) {
        return false;
    }   
    return true;
}