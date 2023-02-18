import React, { CSSProperties } from 'react';
import { Input } from 'src/atoms/Input';
import { Horizontal } from 'src/layout/Horizontal';
import { Vertical } from 'src/layout/Vertical';
import { SumState } from 'src/members/pages/emptySumState';
import { preventDefault } from 'src/utils/preventDefault';

export function VereinsverwaltungSums(props: { sumState: SumState; }) {
    const fleischSoldarStyle: CSSProperties = props.sumState.fleisch.reduziert > props.sumState.fleisch.solidar ?
        { textAlign: 'end', color: 'red' }
        : { textAlign: 'end' }
    const brotSoldarStyle: CSSProperties = props.sumState.brot.reduziert > props.sumState.brot.solidar ?
        { textAlign: 'end', color: 'red' }
        : { textAlign: 'end' }
    const veggieSoldarStyle: CSSProperties = props.sumState.veggie.reduziert > props.sumState.veggie.solidar ?
        { textAlign: 'end', color: 'red' }
        : { textAlign: 'end' }
    return <form onSubmit={preventDefault}>
        <Vertical>
            <b>Insgesamt</b>
            <Horizontal>
                <Input style={{ textAlign: 'end', fontWeight: 'bolder' }} label="Anzahl konsumierende Accounts" maxlen={10} value={String(props.sumState.members)} />
                <Input style={{ textAlign: 'end', fontWeight: 'bolder' }} label="Totale Summe (EUR)" maxlen={10} value={String(props.sumState.totalSum)} />
            </Horizontal>
            <b>Brot</b>
            <Horizontal>
                <Input style={{ textAlign: 'end' }} label="Accounts" maxlen={5} value={String(props.sumState.brot.accountCount)} />
                <Input style={{ textAlign: 'end' }} label="Anteile insgesamt" maxlen={5} value={String(props.sumState.brot.count)} />
                <Input style={brotSoldarStyle} label="Reduzierte Sechstel" maxlen={5} value={String(props.sumState.brot.reduziert)} />
                <Input style={brotSoldarStyle} label="Erhöhte Sechstel" maxlen={5} value={String(props.sumState.brot.solidar)} />
                <Input style={{ textAlign: 'end', fontWeight: 'bold' }} label="Summe (EUR)" maxlen={5} value={String(props.sumState.brot.sum)} />
            </Horizontal>
            <b>Fleisch</b>
            <Horizontal>
                <Input style={{ textAlign: 'end' }} label="Accounts" maxlen={5} value={String(props.sumState.fleisch.accountCount)} />
                <Input style={{ textAlign: 'end' }} label="Anteile insgesamt" maxlen={5} value={String(props.sumState.fleisch.count)} />
                <Input style={fleischSoldarStyle} label="Reduzierte Sechstel" maxlen={5} value={String(props.sumState.fleisch.reduziert)} />
                <Input style={fleischSoldarStyle} label="Erhöhte Sechstel" maxlen={5} value={String(props.sumState.fleisch.solidar)} />
                <Input style={{ textAlign: 'end', fontWeight: 'bold' }} label="Summe (EUR)" maxlen={5} value={String(props.sumState.fleisch.sum)} />
            </Horizontal>
            <b>Gemüse</b>
            <Horizontal>
                <Input style={{ textAlign: 'end' }} label="Accounts" maxlen={5} value={String(props.sumState.veggie.accountCount)} />
                <Input style={{ textAlign: 'end' }} label="Anteile insgesamt" maxlen={5} value={String(props.sumState.veggie.count)} />
                <Input style={veggieSoldarStyle} label="Reduzierte Sechstel" maxlen={5} value={String(props.sumState.veggie.reduziert)} />
                <Input style={veggieSoldarStyle} label="Erhöhte Sechstel" maxlen={5} value={String(props.sumState.veggie.solidar)} />
                <Input style={{ textAlign: 'end', fontWeight: 'bold' }} label="Summe (EUR)" maxlen={5} value={String(props.sumState.veggie.sum)} />
            </Horizontal>
        </Vertical>
    </form>;
}
