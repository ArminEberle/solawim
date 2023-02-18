import { SelectOption } from "src/atoms/Select";
import { Abholraum } from "src/members/types/MemberData";

export const abholraumOptions: SelectOption<Abholraum>[] = [
    {
        value: 'hutzelberghof',
        display: 'Hutzelberghof, Hilgershäuser Str. 20, Oberrieden, Bad Sooden-Allendorf',
    },
    {
        value: 'witzenhausen',
        display: 'Witzenhausen, Nordbahnhofstraße, beim Falafelladen, Witzenhausen',
    },
    {
        value: 'gertenbach',
        display: 'Witzenhausen/Gertenbach, Am Kirchhof, Witzenhausen',
    },
];
