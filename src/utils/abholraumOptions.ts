import { SelectOption } from 'src/atoms/Select';
import { Abholraum } from 'src/members/types/MemberData';

export const abholraumOptions: SelectOption<Abholraum>[] = [
    {
        value: Abholraum.hutzelberghof,
        display: 'Hutzelberghof, Hilgershäuser Str. 20, Oberrieden, Bad Sooden-Allendorf',
    },
    {
        value: Abholraum.witzenhausen,
        display: 'Witzenhausen, Nordbahnhofstraße, beim Falafelladen, Witzenhausen',
    },
    {
        value: Abholraum.gertenbach,
        display: 'Witzenhausen/Gertenbach, Am Kirchhof, Witzenhausen',
    },
];
