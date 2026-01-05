import { SelectOption } from 'src/atoms/Select';
import { Abholraum } from 'src/members/types/MemberData';

export const abholraumOptionsMap: Record<Abholraum, string> = {
    hutzelberghof: 'Hutzelberghof, Hilgershäuser Str. 20, Oberrieden, Bad Sooden-Allendorf',
    witzenhausen: 'Witzenhausen, Nordbahnhofstraße, beim Falafelladen, Witzenhausen',
    gertenbach: 'Witzenhausen/Gertenbach, Am Kirchhof, Witzenhausen',
};

export const abholraumOptions: SelectOption<Abholraum>[] = [
    {
        value: Abholraum.hutzelberghof,
        display: abholraumOptionsMap.hutzelberghof,
    },
    {
        value: Abholraum.witzenhausen,
        display: abholraumOptionsMap.witzenhausen,
    },
    {
        value: Abholraum.gertenbach,
        display: abholraumOptionsMap.gertenbach,
    },
];
