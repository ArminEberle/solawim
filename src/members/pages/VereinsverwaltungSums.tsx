import React, { CSSProperties, useCallback } from 'react';
import { useGetAllMemberData } from 'src/api/getAllMemberData';
import { Button } from 'src/atoms/Button';
import { Output } from 'src/atoms/Output';
import { useSeason } from 'src/atoms/SeasonSelect';
import { Horizontal } from 'src/layout/Horizontal';
import { Vertical } from 'src/layout/Vertical';
import { SumState } from 'src/members/pages/emptySumState';
import { createAndDownloadCSVFile } from 'src/members/utils/createAndDownloadCSVFile';
import { createAndDownloadSepaFiles } from 'src/members/utils/createAndDownloadSepaFiles';
import { preventDefault } from 'src/utils/preventDefault';

export function  VereinsverwaltungSums(props: {
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

    const fleischSoldarStyle: CSSProperties = props.sumState.fleisch.reduziert > props.sumState.fleisch.solidar ?
        { color: 'red' }
        : {}
    const brotSoldarStyle: CSSProperties = props.sumState.brot.reduziert > props.sumState.brot.solidar ?
        { color: 'red' }
        : {}
    const veggieSoldarStyle: CSSProperties = props.sumState.veggie.reduziert > props.sumState.veggie.solidar ?
        { color: 'red' }
        : {}
    return <form onSubmit={preventDefault}>
        <Vertical>
            <b>Insgesamt</b>
            <Horizontal style={{ gap: 0 }}>
                <Output style={{ fontSize: '1.3em', fontWeight: 'bolder' }} label="Anzahl konsumierende Accounts" value={String(props.sumState.members)} />
                <Output style={{
                    fontSize: '1.3em',
                    fontWeight: 'bolder',
                    textDecoration: 'underline',
                }} label="Totale Summe (EUR)" value={String(props.sumState.totalSum)} />
            </Horizontal>
            {memberdataQuery.data && props.withButtons &&
                <Horizontal jc="flex-end" >
                    <Button onClick={createSepaFiles} >SEPA Lastschrift Datei herunterladen</Button>
                    <Button onClick={createCSV} >CSV Datei herunterladen</Button>
                </Horizontal>
            }
            <b>Brot</b>
            <Horizontal style={{ gap: 0 }}>
                <Output style={{}} label="Accounts" value={String(props.sumState.brot.accountCount)} />
                <Output style={{}} label="Anteile insgesamt" value={String(props.sumState.brot.count)} />
                <Output style={brotSoldarStyle} label="Reduzierte Sechstel" value={String(props.sumState.brot.reduziert)} />
                <Output style={brotSoldarStyle} label="Erhöhte Sechstel" value={String(props.sumState.brot.solidar)} />
                <Output style={{ fontSize: '1.3em', fontWeight: 'bolder', textDecoration: 'underline' }} label="Summe (EUR)" value={String(props.sumState.brot.sum)} />
            </Horizontal>
            <b>Fleisch</b>
            <Horizontal style={{ gap: 0 }}>
                <Output style={{}} label="Accounts" value={String(props.sumState.fleisch.accountCount)} />
                <Output style={{}} label="Anteile insgesamt" value={String(props.sumState.fleisch.count)} />
                <Output style={fleischSoldarStyle} label="Reduzierte Sechstel" value={String(props.sumState.fleisch.reduziert)} />
                <Output style={fleischSoldarStyle} label="Erhöhte Sechstel" value={String(props.sumState.fleisch.solidar)} />
                <Output style={{ fontSize: '1.3em', fontWeight: 'bolder', textDecoration: 'underline' }} label="Summe (EUR)" value={String(props.sumState.fleisch.sum)} />
            </Horizontal>
            <b>Milch</b>
            <Horizontal style={{ gap: 0 }}>
                <Output style={{}} label="Accounts" value={String(props.sumState.milch.accountCount)} />
                <Output style={{}} label="Anteile insgesamt" value={String(props.sumState.milch.count)} />
                <div className='output-wrapper'></div>
                <div className='output-wrapper'></div>
                {/* <Output style={fleischSoldarStyle} label="Reduzierte Sechstel" value={0} />
                <Output style={fleischSoldarStyle} label="Erhöhte Sechstel" value={0} /> */}
                <Output style={{ fontSize: '1.3em', fontWeight: 'bolder', textDecoration: 'underline' }} label="Summe (EUR)" value={String(props.sumState.milch.sum)} />
            </Horizontal>
            <b>Gemüse</b>
            <Horizontal style={{ gap: 0 }}>
                <Output style={{}} label="Accounts" value={String(props.sumState.veggie.accountCount)} />
                <Output style={{}} label="Anteile insgesamt" value={String(props.sumState.veggie.count)} />
                <Output style={veggieSoldarStyle} label="Reduzierte Sechstel" value={String(props.sumState.veggie.reduziert)} />
                <Output style={veggieSoldarStyle} label="Erhöhte Sechstel" value={String(props.sumState.veggie.solidar)} />
                <Output style={{ fontSize: '1.3em', fontWeight: 'bolder', textDecoration: 'underline' }} label="Summe (EUR)" value={String(props.sumState.veggie.sum)} />
            </Horizontal>
        </Vertical>
    </form>;
}
