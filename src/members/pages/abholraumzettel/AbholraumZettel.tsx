import 'src/css/abholraumliste.css';
import { Check, Slash } from 'react-feather';
import { useMemo, useState } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { ButtonLink } from 'src/atoms/ButtonLink';
import { SeasonSelect, useSeason } from 'src/atoms/SeasonSelect';
import { RootContext } from 'src/contexts/RootContext';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import { Abholraum } from 'src/members/types/MemberData';
import { defaultMilchAnteilDistribution } from 'src/members/types/MilchAnteilDistribution';
import { DeliverableProduct, deliverableProductToLabelMap, Product } from 'src/members/types/Product';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { abholraumOptionsMap } from 'src/utils/abholraumOptions';
import { Vertical } from 'src/layout/Vertical';
import { productToText } from 'src/members/pages/management/productToText';
import { Button } from 'src/atoms/Button';

type SeasonAndDateData = {
    season: number;
    date: string;
};

const productToDeliveryProductsMap: Partial<Record<Product, DeliverableProduct[]>> = {
    fleisch: [
        DeliverableProduct.FLEISCH,
        DeliverableProduct.MILCH,
        DeliverableProduct.JOGHURT,
        DeliverableProduct.HARTKAESE,
        DeliverableProduct.MILCH_EXTRA,
    ],
    veggie: [DeliverableProduct.VEGGIE],
    brot: [DeliverableProduct.BROT],
};

type PacklisteSelectionSub = {
    showPackliste: boolean;
    showAbholliste: boolean;
};

type PacklisteSelection = Partial<Record<Product, PacklisteSelectionSub>>;

const defaultPacklisteSelection: () => PacklisteSelection = () => ({
    fleisch: { showPackliste: true, showAbholliste: true },
    veggie: { showPackliste: true, showAbholliste: false },
    brot: { showPackliste: true, showAbholliste: true },
});

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

    const [packlisteSelection, setPacklisteSelection] = useState<PacklisteSelection>(defaultPacklisteSelection);

    return (
        <div>
            <section className="noprint">
                <h2>Abholraum-Zettel</h2>
                <p>
                    <label htmlFor="seasonselect">Saison </label>
                    <SeasonSelect name="seasonselect" />
                </p>
                <p>
                    <ButtonLink
                        buttonType="primary"
                        href="/vereinsverwaltung"
                    >
                        Zurück zur Vereinsverwaltung
                    </ButtonLink>
                </p>
                <p>
                    <PacklistenSelect
                        value={packlisteSelection}
                        onChange={newValue => setPacklisteSelection(newValue)}
                    />
                </p>
            </section>
            {allMembersQuery.isLoading && <p>Daten werden geladen...</p>}
            {allMembersQuery.isError && <p>Fehler beim Laden der Daten: {allMembersQuery.error.message}</p>}
            {allMembersQuery.isSuccess && (
                <>
                    <section className="noprint">
                        <p>
                            Hier kannst Du pro Abholraum ausdrucken, was wieviel geliefert und abgeholt werden soll.
                            Einfach die Druckfunktion des Browsers benutzen (Strg+P / Cmd+P).
                            <br />
                            <strong>Wichtig:</strong> Bitte im Druck-Dialog "Hintergrundgrafiken drucken" aktivieren,
                            damit die Tabellenränder mitgedruckt werden.
                        </p>
                    </section>

                    {Object.entries(packlisteSelection).map(([product, packlisteSelectionSub]) => {
                        if (!packlisteSelectionSub.showAbholliste && !packlisteSelectionSub.showPackliste) {
                            return null;
                        }
                        return (
                            <LieferListe
                                key={product}
                                product={product as Product}
                                season={season}
                                date={dateString}
                                packlisteSelectionSub={packlisteSelectionSub}
                                data={abholraumZettelData!}
                            />
                        );
                    })}
                    <AbholListen
                        byAbholraum={abholraumZettelData!.byAbholraum}
                        season={season}
                        date={dateString}
                        packlisteSelection={packlisteSelection}
                    />
                </>
            )}
        </div>
    );
};

const LieferListe = ({
    product,
    season,
    date,
    packlisteSelectionSub,
    data,
}: {
    product: Product;
    packlisteSelectionSub: PacklisteSelectionSub;
    data: AbholraumZettelData;
} & SeasonAndDateData) => {
    return (
        <>
            {packlisteSelectionSub.showPackliste && (
                <section className="start-new-page">
                    <h3>Lieferliste {productToText[product]}, insgesamt zu liefernde Mengen:</h3>
                    <SeasonAndDateDisplay
                        date={date}
                        season={season}
                    />
                    <table className="liste">
                        <thead>
                            <tr>
                                <th>Produkt</th>
                                <th>Menge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productToDeliveryProductsMap[product]?.map(deliverableProductKey => (
                                <tr key={deliverableProductKey}>
                                    <td>{deliverableProductToLabelMap[deliverableProductKey as DeliverableProduct]}</td>
                                    <td className="numCol">
                                        {data.totals[deliverableProductKey as DeliverableProduct]}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {Object.values(Abholraum).map(abholraum => {
                        const deliverableProducts = productToDeliveryProductsMap[product];
                        let hasDeliveries = false;
                        for (const deliverableProduct of deliverableProducts ?? []) {
                            if (data.byAbholraum[abholraum].sums[deliverableProduct] > 0) {
                                hasDeliveries = true;
                                break;
                            }
                        }
                        return (
                            <>
                                <h3>Abholraum: {abholraumOptionsMap[abholraum]}</h3>
                                <table className="liste">
                                    <thead>
                                        <tr>
                                            <th className="leftCol">Produkt</th>
                                            <th className="numCol">Menge</th>
                                            <th className="numCol">Gepackt (zum Abhaken)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!hasDeliveries && (
                                            <tr>
                                                <td colSpan={3}>Nichts zu liefern für diesen Abholraum.</td>
                                            </tr>
                                        )}
                                        {hasDeliveries &&
                                            // Object.entries(data.byAbholraum[abholraum].sums).map(
                                            (deliverableProducts ?? []).map(productKey => (
                                                <tr key={productKey}>
                                                    <td className="leftCol">
                                                        {deliverableProductToLabelMap[productKey as DeliverableProduct]}
                                                    </td>
                                                    <td className="numCol">
                                                        {data.byAbholraum[abholraum].sums[productKey]}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </>
                        );
                    })}
                </section>
            )}
            {false && packlisteSelectionSub.showAbholliste && (
                <>
                    {Object.values(Abholraum).map(abholraum => {
                        const sortedMembers = data.byAbholraum[abholraum].member.sort((a, b) => {
                            const lastNameComparison = a.lastname.localeCompare(b.lastname);
                            if (lastNameComparison !== 0) {
                                return lastNameComparison;
                            }
                            return a.firstname.localeCompare(b.firstname);
                        });
                        let hasDeliveries = false;
                        for (const member of sortedMembers) {
                            for (const deliverableProduct of productToDeliveryProductsMap[product] ?? []) {
                                if (member.memberAnteile[deliverableProduct] > 0) {
                                    hasDeliveries = true;
                                    break;
                                }
                            }
                        }
                        if (!hasDeliveries) {
                            return null;
                        }
                        return (
                            <section className="start-new-page">
                                <h3>
                                    Abholliste {productToText[product]}, Abholraum: {abholraumOptionsMap[abholraum]}
                                </h3>
                                <p>
                                    {date}, Höhberg Kollektiv Abholraumliste, Saison {season}
                                </p>
                                <h4>Mengen pro Mitglied:</h4>
                                <table className="liste">
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
                        );
                    })}
                </>
            )}
        </>
    );
};

const AbholListen = ({
    byAbholraum,
    season,
    date,
    packlisteSelection,
}: Pick<AbholraumZettelData, 'byAbholraum'> & SeasonAndDateData & { packlisteSelection: PacklisteSelection }) => {
    return (
        <div>
            {Object.entries(byAbholraum).map(([abholraum, data]) => (
                <AbholListe
                    key={abholraum}
                    abholraum={abholraum as Abholraum}
                    data={data}
                    season={season}
                    date={date}
                    packlisteSelection={packlisteSelection}
                />
            ))}
        </div>
    );
};

const AbholListe = ({
    abholraum,
    data,
    season,
    date,
    packlisteSelection,
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
    packlisteSelection: PacklisteSelection;
} & SeasonAndDateData) => {
    const sortedMembers = useMemo(() => {
        return data.member.sort((a, b) => {
            const lastNameComparison = a.lastname.localeCompare(b.lastname);
            if (lastNameComparison !== 0) {
                return lastNameComparison;
            }
            return a.firstname.localeCompare(b.firstname);
        });
    }, [data.member]);

    const deliverableProductsToShow = useMemo(() => {
        const products: DeliverableProduct[] = [];
        for (const [productKey, selection] of Object.entries(packlisteSelection)) {
            if (selection.showAbholliste) {
                const mappedDeliverableProducts = productToDeliveryProductsMap[productKey as Product];
                if (mappedDeliverableProducts) {
                    products.push(...mappedDeliverableProducts);
                }
            }
        }
        return products;
    }, [packlisteSelection]);
    let hasDeliveries = false;
    for (const member of sortedMembers) {
        for (const deliverableProduct of deliverableProductsToShow ?? []) {
            if (member.memberAnteile[deliverableProduct] > 0) {
                hasDeliveries = true;
                break;
            }
        }
    }
    if (!hasDeliveries) {
        return null;
    }
    return (
        <>
            <section className="start-new-page">
                <h3>Abholliste Abholraum: {abholraumOptionsMap[abholraum]}</h3>
                <SeasonAndDateDisplay
                    date={date}
                    season={season}
                />
                <h4>Mengen pro Mitglied:</h4>
                <table className="liste">
                    <thead>
                        <tr>
                            <th>Mitglied</th>
                            {deliverableProductsToShow.map(productKey => (
                                <th key={productKey}>
                                    {deliverableProductToLabelMap[productKey as DeliverableProduct]}
                                </th>
                            ))}
                            <th>Abgeholt (Bitte abhaken)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMembers
                            .filter(member => {
                                let hasDeliveries = false;
                                for (const deliverableProduct of deliverableProductsToShow) {
                                    if (member.memberAnteile[deliverableProduct] > 0) {
                                        hasDeliveries = true;
                                        break;
                                    }
                                }
                                return hasDeliveries;
                            })
                            .map(member => (
                                <tr key={member.id}>
                                    <td>
                                        {member.lastname}, {member.firstname}
                                    </td>
                                    {deliverableProductsToShow.map(productKey => (
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

type PacklistenSelectProps = {
    value: PacklisteSelection;
    onChange: (newValue: PacklisteSelection) => void;
};

const PacklistenSelect = ({ value, onChange }: PacklistenSelectProps) => {
    return (
        <div>
            <b>Auswahl der Packlisten/Abholraumzettel</b>
            <Vertical>
                <table className="layout">
                    <tbody>
                        {Object.entries(value).map(([productKey, selection]) => (
                            <tr key={productKey}>
                                <td
                                    className="clickable"
                                    onClick={event => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        const showAll = !(selection.showPackliste && selection.showAbholliste);
                                        onChange({
                                            ...value,
                                            [productKey]: {
                                                showPackliste: showAll,
                                                showAbholliste: showAll,
                                            },
                                        });
                                    }}
                                    style={{ width: '300px' }}
                                >
                                    <Button style={{ width: '100%' }}>
                                        {productToText[productKey as Product]} <small>(zum Umschalten klicken)</small>
                                    </Button>
                                </td>
                                <td
                                    className="clickable"
                                    onClick={event => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onChange({
                                            ...value,
                                            [productKey]: {
                                                ...selection,
                                                showPackliste: !selection.showPackliste,
                                            },
                                        });
                                    }}
                                    style={{ width: '130px' }}
                                >
                                    <Button style={{ width: '100%' }}>
                                        {selection.showPackliste && (
                                            <Check
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                            />
                                        )}
                                        {!selection.showPackliste && (
                                            <Slash
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                            />
                                        )}
                                        <span style={{ marginLeft: '8px' }}>Packliste</span>
                                    </Button>
                                </td>
                                <td
                                    className="clickable"
                                    onClick={event => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onChange({
                                            ...value,
                                            [productKey]: {
                                                ...selection,
                                                showAbholliste: !selection.showAbholliste,
                                            },
                                        });
                                    }}
                                    style={{ width: '130px' }}
                                >
                                    <Button style={{ width: '100%' }}>
                                        {selection.showAbholliste && (
                                            <Check
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                            />
                                        )}
                                        {!selection.showAbholliste && (
                                            <Slash
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                            />
                                        )}
                                        <span style={{ marginLeft: '8px' }}>Abholliste</span>
                                    </Button>
                                </td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Vertical>
        </div>
    );
};

const SeasonAndDateDisplay = ({ date, season }: SeasonAndDateData) => {
    return (
        <p>
            Datum <b>{date}</b>, Höhberg Kollektiv Abholraumliste, Saison <b>{season}</b>
        </p>
    );
};
