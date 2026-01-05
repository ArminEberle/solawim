import 'src/css/abholraumliste.css';
import { useMemo, useState } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import { SeasonSelect, useSeason } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { Abholraum } from 'src/members/types/MemberData';
import { defaultMilchAnteilDistribution } from 'src/members/types/MilchAnteilDistribution';
import { DeliverableProduct, deliverableProductToLabelMap } from 'src/members/types/Product';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { abholraumOptionsMap } from 'src/utils/abholraumOptions';

type SeasonAndDate = {
    season: number;
    date: string;
};

/**
 * Displays for each Abholraum:
 * 1. What to deliver into this Abholraum.
 * 2. What each member can pick up from this Abholraum.
 *
 * The delivery list is the first page of each Abholraum.
 * The pickup list is the second page of each Abholraum.
 * @returns
 */
export const AbholraumZettel = () => {
    return (
        <>
            <LoggedInScope
                loginHint={
                    <ButtonLink
                        buttonType="primary"
                        href="/anmelden/?redirect_to=/wp-content/plugins/solawim/abholraumzettel.php"
                    >
                        Bitte log Dich erst ein.
                    </ButtonLink>
                }
            >
                <RootContext>
                    <AbholraumZettelPageInternal />
                </RootContext>
            </LoggedInScope>
        </>
    );
};

const AbholraumZettelPageInternal = () => {
    const [updateTimestamp] = useState(new Date().getTime());
    const season = useSeason();
    const allMembersQuery = useGetAllMemberData();
    const abholraumZettelData = useMemo(() => {
        if (allMembersQuery.data) {
            return computeAbholraumZettelData(allMembersQuery.data);
        }
        return null;
    }, [allMembersQuery.data]);

    const dateString = useState(() => {
        const now = new Date(updateTimestamp);
        return now.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    })[0];

    return (
        <div>
            <section className="noprint">
                <h2>Abholraum-Zettel</h2>
                <br />
                <label htmlFor="seasonselect">Saison </label>
                <SeasonSelect name="seasonselect" />
                <br />
                <br />
                <br />
                <ButtonLink
                    buttonType="primary"
                    href="/vereinsverwaltung"
                >
                    Zurück zur Vereinsverwaltung
                </ButtonLink>
            </section>
            {allMembersQuery.isLoading && <p>Daten werden geladen...</p>}
            {allMembersQuery.isError && <p>Fehler beim Laden der Daten: {allMembersQuery.error.message}</p>}
            {allMembersQuery.isSuccess && (
                <>
                    <section className="start-new-page">
                        <p className="noprint">
                            Hier kannst Du pro Abholraum ausdrucken, was wieviel geliefert und abgeholt werden soll.
                            Einfach die Druckfunktion des Browsers benutzen (Strg+P / Cmd+P).
                            <br />
                            <strong>Wichtig:</strong> Bitte im Druck-Dialog "Hintergrundgrafiken drucken" aktivieren,
                            damit die Tabellenränder mitgedruckt werden.
                        </p>
                        <h3>Gesamt-Lieferliste, insgesamt zu liefernde Mengen:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Produkt</th>
                                    <th>Menge</th>
                                    <th>Gepackt (zum Abhaken)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(abholraumZettelData!.totals).map(([productKey, amount]) => (
                                    <tr key={productKey}>
                                        <td>{deliverableProductToLabelMap[productKey as DeliverableProduct]}</td>
                                        <td className="numCol">{amount}</td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <AllAbholraumSections
                        byAbholraum={abholraumZettelData!.byAbholraum}
                        season={season}
                        date={dateString}
                    />
                </>
            )}
        </div>
    );
};

const AllAbholraumSections = ({
    byAbholraum,
    season,
    date,
}: Pick<AbholraumZettelData, 'byAbholraum'> & SeasonAndDate) => {
    return (
        <div>
            {Object.entries(byAbholraum).map(([abholraum, data]) => (
                <AbholraumZettelAbholraumSection
                    key={abholraum}
                    abholraum={abholraum as Abholraum}
                    data={data}
                    season={season}
                    date={date}
                />
            ))}
        </div>
    );
};

const AbholraumZettelAbholraumSection = ({
    abholraum,
    data,
    season,
    date,
}: {
    abholraum: Abholraum;
    data: {
        sums: Record<DeliverableProduct, number>;
        member: Array<{
            id: string;
            firstname: string;
            lastname: string;
            memberAnteile: Record<DeliverableProduct, number>;
        }>;
    };
} & SeasonAndDate) => {
    const sortedMembers = useMemo(() => {
        return data.member.sort((a, b) => {
            const lastNameComparison = a.lastname.localeCompare(b.lastname);
            if (lastNameComparison !== 0) {
                return lastNameComparison;
            }
            return a.firstname.localeCompare(b.firstname);
        });
    }, [data.member]);
    sortedMembers;
    return (
        <>
            <section className="start-new-page">
                <h3>Lieferliste Abholraum: {abholraumOptionsMap[abholraum]}</h3>
                <p>
                    {date}, Höhberg Kollektiv Abholraumliste, Saison {season}
                </p>
                <h4>Zu liefernde Mengen:</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Produkt</th>
                            <th>Menge</th>
                            <th>Gepackt (zum Abhaken)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMembers.length === 0 && (
                            <tr>
                                <td colSpan={3}>Keine Mitglieder für diesen Abholraum.</td>
                            </tr>
                        )}
                        {sortedMembers.length > 0 &&
                            Object.entries(data.sums).map(([productKey, amount]) => (
                                <tr key={productKey}>
                                    <td>{deliverableProductToLabelMap[productKey as DeliverableProduct]}</td>
                                    <td className="numCol">{amount}</td>
                                    <td></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </section>
            <section className="start-new-page">
                <h3>Abholliste Abholraum: {abholraumOptionsMap[abholraum]}</h3>
                <p>
                    {date}, Höhberg Kollektiv Abholraumliste, Saison {season}
                </p>
                <h4>Mengen pro Mitglied:</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Mitglied</th>
                            {Object.values(DeliverableProduct).map(productKey => (
                                <th key={productKey}>
                                    {deliverableProductToLabelMap[productKey as DeliverableProduct]}
                                </th>
                            ))}
                            <th>Abgeholt (Bitte abhaken)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMembers.length === 0 && (
                            <tr>
                                <td colSpan={Object.values(DeliverableProduct).length + 2}>
                                    Keine Mitglieder für diesen Abholraum.
                                </td>
                            </tr>
                        )}
                        {sortedMembers.length > 0 &&
                            sortedMembers.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        {member.lastname}, {member.firstname}
                                    </td>
                                    {Object.values(DeliverableProduct).map(productKey => (
                                        <td
                                            key={productKey}
                                            className="numCol"
                                        >
                                            {member.memberAnteile[productKey] > 0
                                                ? member.memberAnteile[productKey]
                                                : ''}
                                        </td>
                                    ))}
                                    <td></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </section>
        </>
    );
};

type AbholraumZettelData = {
    byAbholraum: Record<
        Abholraum,
        {
            sums: Record<DeliverableProduct, number>;
            member: Array<{
                id: string;
                firstname: string;
                lastname: string;
                memberAnteile: Record<DeliverableProduct, number>;
            }>;
        }
    >;
    totals: Record<DeliverableProduct, number>;
};

const computeAbholraumZettelData = (members: AllMembersData): AbholraumZettelData => {
    const totals: Record<DeliverableProduct, number> = emptyDeliverableProductRecord();
    const abholraumData: Record<
        Abholraum,
        {
            sums: Record<DeliverableProduct, number>;
            member: Array<{
                id: string;
                firstname: string;
                lastname: string;
                memberAnteile: Record<DeliverableProduct, number>;
            }>;
        }
    > = {
        hutzelberghof: { sums: emptyDeliverableProductRecord(), member: [] },
        gertenbach: { sums: emptyDeliverableProductRecord(), member: [] },
        witzenhausen: { sums: emptyDeliverableProductRecord(), member: [] },
    };
    for (const member of members) {
        if (!member.membership?.member) {
            continue;
        }
        const abholraum = member.membership.abholraum;
        if (!abholraum) {
            continue;
        }
        const abholraumRecord = abholraumData[abholraum];
        const memberRecord = emptyDeliverableProductRecord();
        memberRecord.deliverable_veggie = Number.parseInt(member.membership.veggieMenge ?? '0') ?? 0;
        memberRecord.deliverable_veggie = Number.parseInt(member.membership.veggieMenge ?? '0') ?? 0;
        memberRecord.deliverable_brot = Number.parseInt(member.membership.brotMenge ?? '0') ?? 0;
        const fleischMenge = Number.parseInt(member.membership.fleischMenge ?? '0') ?? 0;
        memberRecord.deliverable_fleisch = fleischMenge;
        if (fleischMenge > 0) {
            memberRecord.deliverable_milch = Number.parseInt(member.membership.milchMenge ?? '0') ?? 0;
            const milchAnteilDistribution =
                member.membership.milchAnteilDistribution ?? defaultMilchAnteilDistribution();

            memberRecord.deliverable_milch =
                memberRecord.deliverable_milch + milchAnteilDistribution.milch * fleischMenge;
            memberRecord.deliverable_joghurt = milchAnteilDistribution.joghurt * fleischMenge;
            memberRecord.deliverable_hartkaese = milchAnteilDistribution.hartkaese * fleischMenge;
            memberRecord.deliverable_extra = milchAnteilDistribution.extra * fleischMenge;
        }
        abholraumRecord.member.push({
            id: member.id,
            firstname: member.membership.firstname,
            lastname: member.membership.lastname,
            memberAnteile: memberRecord,
        });
        for (const deliverableProductKey of Object.values(DeliverableProduct)) {
            abholraumRecord.sums[deliverableProductKey] += memberRecord[deliverableProductKey];
            totals[deliverableProductKey] += memberRecord[deliverableProductKey];
        }
    }
    return { byAbholraum: abholraumData, totals };
};

const emptyDeliverableProductRecord = (): Record<DeliverableProduct, number> => {
    return {
        deliverable_fleisch: 0,
        deliverable_milch: 0,
        deliverable_joghurt: 0,
        deliverable_hartkaese: 0,
        deliverable_extra: 0,
        deliverable_brot: 0,
        deliverable_veggie: 0,
    };
};
