import React, { useState } from 'react';
import { DataElement } from 'src/atoms/DataElement';
import { Horizontal } from "src/layout/Horizontal";
import { Vertical } from "src/layout/Vertical";
import { SingleMemberData } from 'src/members/types/AllMembersData';
import { AiOutlineMail } from 'react-icons/ai';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { prices } from 'src/utils/prices';
import { calculateMemberTotalSum } from 'src/members/utils/calculateMemberTotalSum';
import { Checkbox } from 'src/atoms/Checkbox';
import { MemberEditMolecule } from 'src/members/pages/MemberEditMolecule';
import { setMemberData } from 'src/api/setMemberData';
import { useSeason } from 'src/atoms/SeasonSelect';

export type MemberDetailMoleculeProps = {
    data: SingleMemberData;
    key: string;
    reloadCb: () => void;
}

export const MemberDetailMolecule = (props: MemberDetailMoleculeProps) => {
    const [editState, setEditState] = useState(false);
    const season = useSeason();

    return <Vertical key={props.key} className="dl-container">
        <Horizontal>
            <b style={{ fontSize: '1.1em' }}>{props.data.membership?.firstname} {props.data.membership?.lastname} ({props.data.user_nicename})</b>
            <Checkbox kind="toggle" className="fg-0" value={editState} onChange={ev => setEditState(ev.target.checked)}>Ändern</Checkbox>
        </Horizontal>
        <Horizontal jc="space-between" style={{ gap: "0px" }}>
            <DataElement label="ID" className="fg-0">{props.data.id}</DataElement>
            <DataElement label="Email">{props.data.user_email}<a href={'mailto:' + props.data.user_email}><AiOutlineMail /></a></DataElement>
            <DataElement label="Gebucht" className="fg-0">{(props.data.membership && props.data.membership.member && <b>JA</b>) || "NEIN"}</DataElement>
        </Horizontal>
        {!editState && props.data.membership && props.data.membership.member &&
            <>
                <Horizontal jc="space-between" style={{ gap: "0px" }}>
                    <DataElement label="Adresse">{props.data.membership.street}, {props.data.membership.plz} {props.data.membership.city}</DataElement>
                    <DataElement label="Tel">{props.data.membership.tel}</DataElement>
                </Horizontal>
                <br />
                <DataElement label="Lastschriftverfahren" className="fg-0">{(props.data.membership && (props.data.membership.useSepa ?? true) && <b>JA</b>) || "NEIN"}</DataElement>
                {
                    (props.data.membership.useSepa ?? true) &&
                    <>
                        <Horizontal>
                            <DataElement label='Kontoinhaber/in'>
                                {props.data.membership.accountowner}
                            </DataElement>
                            <DataElement label='Kontoinhaber/in Adresse'>
                                {props.data.membership.accountownerStreet},
                                {props.data.membership.accountownerPlz} {props.data.membership.accountownerCity}
                            </DataElement>
                        </Horizontal>
                        <Horizontal>
                            <DataElement label='Bank' >{props.data.membership.bank}</DataElement>
                            <DataElement label='BIC' >{props.data.membership.bic}</DataElement>
                            <DataElement label='IBAN' >{props.data.membership.iban}</DataElement>
                        </Horizontal>
                        <br />
                    </>
                }
                <DataElement label="Abholraum" >
                    {props.data.membership.abholraum}
                </DataElement>
                <Horizontal style={{ gap: "0px" }}>
                    <DataElement label="Brot&nbsp;Menge">{props.data.membership.brotMenge}</DataElement>
                    <DataElement label="Brot&nbsp;Solidar">{props.data.membership.brotSolidar}</DataElement>
                    <DataElement label="Brot&nbsp;Summe">
                        <div style={{ alignSelf: 'end', textAlign: 'right' }} >
                            {calculatePositionSum({
                                amount: props.data.membership.brotMenge,
                                solidar: props.data.membership.brotSolidar,
                                price: prices[season].brot,
                            })}
                        </div>
                    </DataElement>
                </Horizontal>
                <Horizontal style={{ gap: "0px" }}>
                    <DataElement label="Gemüse&nbsp;Menge">{props.data.membership.veggieMenge}</DataElement>
                    <DataElement label="Gemüse&nbsp;Solidar">{props.data.membership.veggieSolidar}</DataElement>
                    <DataElement label="Gemüse&nbsp;Summe">
                        <div style={{ alignSelf: 'end', textAlign: 'right' }} >
                            {calculatePositionSum({
                                amount: props.data.membership.veggieMenge,
                                solidar: props.data.membership.veggieSolidar,
                                price: prices[season].veggie,
                            })}
                        </div>
                    </DataElement>
                </Horizontal>
                <Horizontal style={{ gap: "0px" }}>
                    <DataElement label="Fleisch&nbsp;Menge">{props.data.membership.fleischMenge}</DataElement>
                    <DataElement label="Fleisch&nbsp;Solidar">{props.data.membership.fleischSolidar}</DataElement>
                    <DataElement label="Fleisch&nbsp;Summe">
                        <div style={{ alignSelf: 'end', textAlign: 'right' }} >
                            {calculatePositionSum({
                                amount: props.data.membership.fleischMenge,
                                solidar: props.data.membership.fleischSolidar,
                                price: prices[season].fleisch,
                            })}
                        </div>
                    </DataElement>
                </Horizontal>
                <Horizontal style={{ gap: "0px" }}>
                    <DataElement label="Milch&nbsp;Menge">{props.data.membership.milchMenge}</DataElement>
                    <DataElement label="Milch&nbsp;Solidar">{props.data.membership.milchSolidar}</DataElement>
                    <DataElement label="Milch&nbsp;Summe">
                        <div style={{ alignSelf: 'end', textAlign: 'right' }} >
                            {calculatePositionSum({
                                amount: props.data.membership.milchMenge,
                                solidar: props.data.membership.milchSolidar,
                                price: prices[season].milch,
                            })}
                        </div>
                    </DataElement>
                </Horizontal>
                <DataElement label="Mitgliedsbeitrag">
                    <b style={{ alignSelf: 'end', textAlign: 'right', fontWeight: 'bolder', textDecoration: 'underline' }}>
                        {calculateMemberTotalSum(props.data.membership, season)}
                    </b>
                </DataElement>
            </>
        }
        {
            editState && <>
                <br />
                <MemberEditMolecule
                    data={props.data.membership}
                    required={false}
                    onSave={async memberData => {
                        await setMemberData({
                            targetUserId: props.data.id,
                            memberData: memberData,
                        }, season)
                        props.reloadCb();
                    }}
                />
            </>
        }
    </Vertical>
}