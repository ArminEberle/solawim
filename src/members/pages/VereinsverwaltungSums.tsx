import type { CSSProperties } from 'react';
import { useCallback } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { Button } from 'src/atoms/Button';
import { Output } from 'src/atoms/Output';
import { useSeason } from 'src/atoms/SeasonSelect';
import { Horizontal } from 'src/layout/Horizontal';
import { Vertical } from 'src/layout/Vertical';
import { SumState } from 'src/members/pages/emptySumState';
import { Product } from 'src/members/types/Product';
import { createAndDownloadCSVFile } from 'src/members/utils/createAndDownloadCSVFile';
import { createAndDownloadSepaFiles } from 'src/members/utils/createAndDownloadSepaFiles';
import { preventDefault } from 'src/utils/preventDefault';

const productToText: Record<Product, string> = {
    fleisch: 'Fleisch',
    milch: 'Milch',
    brot: 'Brot',
    veggie: 'Gemüse',
};

export function VereinsverwaltungSums(props: {
    sumState: SumState;
    withButtons?: boolean;
}) {
    const memberdataQuery = useGetAllMemberData();

    const season = useSeason();

    const createSepaFiles = useCallback(async () => {
        await memberdataQuery.refetch();
        await createAndDownloadSepaFiles(memberdataQuery.data, season);
    }, [memberdataQuery]);

    const createCSV = useCallback(async () => {
        await memberdataQuery.refetch();
        await createAndDownloadCSVFile(memberdataQuery.data, season);
    }, [memberdataQuery]);

    return (
        <form onSubmit={preventDefault}>
            <Vertical>
                <b>Insgesamt</b>
                <Horizontal style={{ gap: 0 }}>
                    <Output
                        style={{ fontSize: '1.3em', fontWeight: 'bolder' }}
                        label="Anzahl konsumierende Accounts"
                        value={String(props.sumState.members)}
                    />
                    <Output
                        style={{ fontSize: '1.3em', fontWeight: 'bolder' }}
                        label="Anzahl Anteile gegen Mitarbeit"
                        value={String(props.sumState.activeCount)}
                    />
                    <Output
                        style={{
                            fontSize: '1.3em',
                            fontWeight: 'bolder',
                            textDecoration: 'underline',
                        }}
                        label="Totale Summe (EUR)"
                        value={String(props.sumState.totalSum)}
                    />
                </Horizontal>
                {memberdataQuery.data && props.withButtons && (
                    <Horizontal jc="flex-end">
                        <Button onClick={createSepaFiles}>SEPA Lastschrift Datei herunterladen</Button>
                        <Button onClick={createCSV}>CSV Datei herunterladen</Button>
                    </Horizontal>
                )}
                {Object.values(Product).map(product => (
                    <ProductSums
                        key={product}
                        product={product}
                        sums={props.sumState}
                    />
                ))}
            </Vertical>
        </form>
    );
}

const ProductSums = ({
    product,
    sums,
}: {
    product: Product;
    sums: SumState;
}) => {
    const style: CSSProperties = sums[product].reduziert > sums[product].solidar ? { color: 'red' } : {};
    return (
        <div>
            <b>{productToText[product]}</b>
            <Horizontal style={{ gap: 0 }}>
                <Output
                    style={{}}
                    label="Accounts"
                    value={String(sums[product].accountCount)}
                />
                <Output
                    style={{}}
                    label="Anteile insgesamt"
                    value={String(sums[product].amount)}
                />
                <Output
                    style={{}}
                    label="Anteile gegen Mitarbeit"
                    value={String(sums[product].activeCount)}
                />
                <Output
                    style={style}
                    label="Reduzierte Sechstel"
                    value={String(sums[product].reduziert)}
                />
                <Output
                    style={style}
                    label="Erhöhte Sechstel"
                    value={String(sums[product].solidar)}
                />
                <Output
                    style={{ fontSize: '1.3em', fontWeight: 'bolder', textDecoration: 'underline' }}
                    label="Summe (EUR)"
                    value={String(sums[product].sum)}
                />
            </Horizontal>
        </div>
    );
};
