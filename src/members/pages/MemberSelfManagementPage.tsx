
import 'src/css/form.css';

import { electronicFormatIBAN } from 'ibantools';
import isEqual from 'lodash.isequal';
import React, { useState } from 'react';
import { getMyData } from 'src/api/getMyData';
import { setMyData } from 'src/api/setMyData';
import { Alert } from 'src/atoms/Alert';
import { Button } from 'src/atoms/Button';
import { Checkbox } from 'src/atoms/Checkbox';
import { Input } from 'src/atoms/Input';
import { InputPlz } from 'src/atoms/InputPlz';
import type { SelectOption } from 'src/atoms/Select';
import { Select } from 'src/atoms/Select';
import { SolidaritaetSelect } from 'src/atoms/SolidaritaetSelect';
import { Horizontal } from 'src/layout/Horizontal';
import { Page } from 'src/layout/Page';
import { Vertical } from 'src/layout/Vertical';
import {
    MemberSelfManagementPageConditions, MemberSelfManagementPageInto, MemberSelfManagementPagePassiveHint, MemberSelfManagementPageYesIWant
} from 'src/members/pages/MemberSelfManagementPageText';
import type { MemberData } from 'src/members/types/MemberData';
import { emptyMemberData } from 'src/members/types/MemberData';
import { calculatePositionPrice } from 'src/members/utils/calculatePositionPrice';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { formMe } from 'src/utils/forms';
import { prices } from 'src/utils/prices';
import { WaitForIt } from 'src/utils/WaitForIt';
import { ibanValidator } from 'src/validators/ibanValidator';

const required = true;

const amountsToBook = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
// const amountsToBookFleisch = [0, { value: 0.5, display: 'halber' }, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
const abholraumOptions: SelectOption[] = [
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

let globalDirty = false;

window.addEventListener('beforeunload', (event) => {
    if (globalDirty) {
        event.preventDefault();
        return event.returnValue = '';
    }
});

export const MemberSelfManagementPage = (props: React.PropsWithChildren) => {
    const [serverState, setServerState] = useState(emptyMemberData());
    const [reloadState, setReloadState] = useState(true);

    const {
        handleSubmit,
        register,
        state: formDataState,
        setState: setFormDataState,
    } = formMe({
        data: emptyMemberData(),
        onSubmit: async(data, setData) => {
            const result = await setMyData(data);
            setReloadState(true);
        },
    });

    const fetchFormData = async() => {
        const data = (await getMyData()) ?? emptyMemberData();
        setFormDataState({ ...data });
        setServerState({ ...data });
        setReloadState(false);
    };

    const calculateTotalSum = (data: MemberData) =>
        calculatePositionSum({
            amount: data.brotMenge,
            solidar: data.brotSolidar,
            price: prices.brot,
        })
            + calculatePositionSum({
                amount: data.fleischMenge,
                solidar: data.fleischSolidar,
                price: prices.fleisch,
            })
            + calculatePositionSum({
                amount: data.veggieMenge,
                solidar: data.veggieSolidar,
                price: prices.veggie,
            });

    const isDirty = !isEqual(formDataState, serverState);
    globalDirty = isDirty;

    // stopPropagation in next line is to prevent errors in elementor
    return <div onKeyDown={e => e.stopPropagation()}>
        <LoggedInScope>
            <Page>
                <WaitForIt callback={fetchFormData} redo={reloadState}>
                    <MemberSelfManagementPageInto />
                    <MemberSelfManagementPageYesIWant />
                    <MemberSelfManagementPageConditions />
                    <MemberSelfManagementPagePassiveHint />
                    <br/>

                    {isDirty && <Alert>Bitte speichern (ganz unten) nicht vergessen</Alert>}
                    {!isDirty && <div><p className="alert">Diese Daten haben wir momentan von Dir gespeichert:</p><br/></div>}

                    <form className="pure-form" onSubmit={handleSubmit}>
                        <Horizontal jc="space-between">
                            <Checkbox {...register('member')}>
                            Ja ich möchte dabei sein in der Saison April 2023 / März 2024
                            </Checkbox>
                            <Checkbox {...register('member')} negate={true}>
                            Nein, ich bin nicht dabei.
                            </Checkbox>
                        </Horizontal>

                        <br/>

                        <h3>Deine Anteile</h3>

                        <Horizontal>
                            <h3 className="min-w-8 max-w-8">Brot</h3>
                            <Select
                                label="Anzahl"
                                options={amountsToBook}
                                required={required}
                                disabled={!formDataState.member}
                                maxWidth={6}
                                {...register('brotMenge')}
                            />
                            <SolidaritaetSelect
                                required={required}
                                disabled={!formDataState.member}
                                {...register('brotSolidar')}
                            />
                            <div style={{
                                alignSelf: 'flex-end',
                                paddingBottom: '1rem',
                                flexGrow: 1,
                            }}>
                                <small >
                        ({calculatePositionPrice({
                                        price: prices.brot,
                                        solidar: formDataState.brotSolidar,
                                    })} EUR / pro Anteil)
                                </small>
                            </div>
                            <Input
                                label="Summe"
                                value={String(calculatePositionSum({
                                    amount: formDataState.brotMenge,
                                    solidar: formDataState.brotSolidar,
                                    price: prices.brot,
                                }))}
                                disabled={true}
                                maxlen={4}
                                maxWidth={4}
                                style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                            />
                        </Horizontal>

                        <Horizontal>
                            <h3 className="min-w-8 max-w-8">Fleich / Käse</h3>
                            <Select
                                label="Anzahl"
                                // options={amountsToBookFleisch}
                                options={amountsToBook}
                                maxWidth={6}
                                required={required}
                                disabled={!formDataState.member}
                                {...register('fleischMenge')}
                            />
                            <SolidaritaetSelect
                                required={required}
                                disabled={!formDataState.member}
                                {...register('fleischSolidar')}
                            />
                            <div style={{
                                alignSelf: 'flex-end',
                                paddingBottom: '1rem',
                                flexGrow: 1,
                            }}>
                                <small >
                        ({calculatePositionPrice({
                                        price: prices.fleisch,
                                        solidar: formDataState.fleischSolidar,
                                    })} EUR / pro Anteil)
                                </small>
                            </div>
                            <Input
                                label="Summe"
                                value={String(calculatePositionSum({
                                    amount: formDataState.fleischMenge,
                                    solidar: formDataState.fleischSolidar,
                                    price: prices.fleisch,
                                }))}
                                disabled={true}
                                maxlen={4}
                                maxWidth={4}
                                style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                            />
                        </Horizontal>

                        <Horizontal>
                            <h3 className="min-w-8 max-w-8">Gemüse</h3>
                            <Select
                                label="Anzahl"
                                options={amountsToBook}
                                maxWidth={6}
                                required={required}
                                disabled={!formDataState.member}
                                {...register('veggieMenge')}
                            />
                            <SolidaritaetSelect
                                required={required}
                                disabled={!formDataState.member}
                                {...register('veggieSolidar')}
                            />
                            <div style={{
                                alignSelf: 'flex-end',
                                paddingBottom: '1rem',
                                flexGrow: 1,
                            }}>
                                <small >
                        ({calculatePositionPrice({
                                        price: prices.veggie,
                                        solidar: formDataState.veggieSolidar,
                                    })} EUR / pro Anteil)
                                </small>
                            </div>
                            <Input
                                label="Summe"
                                value={String(calculatePositionSum({
                                    amount: formDataState.veggieMenge,
                                    solidar: formDataState.veggieSolidar,
                                    price: prices.veggie,
                                }))}
                                disabled={true}
                                maxlen={4}
                                maxWidth={4}
                                style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                            />
                        </Horizontal>
                        <br/>
                        {calculateTotalSum(formDataState) > 0
                && <p className="alert">
                    In Summe werde ich dann ab April 2023 bis einschließlich März 2024 zum Anfang jeden
                    Monats <b>{calculateTotalSum(formDataState)},-&nbsp;EUR</b> bezahlen.
                </p>
                        }
                        <br/>
                        <p>
                Abholen möchte ich die Anteile dann wöchentlich im Abholraum:
                        </p>
                        <Select
                            options={abholraumOptions}
                            required={required}
                            disabled={!formDataState.member}
                            {...register('abholraum')}
                        />

                        <h3 className="form-header">Deine Person</h3>
                        <Vertical>
                            <Horizontal>
                                <Input label="Vorname"
                                    minlen={1}
                                    maxlen={50}
                                    autocomplete="given-name"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('firstname')}
                                />
                                <Input
                                    label="Nachame"
                                    minlen={3}
                                    maxlen={50}
                                    autocomplete="family-name"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('lastname')}
                                />
                            </Horizontal>
                            <Input
                                label="Strasse und Hausnummer"
                                minlen={3}
                                maxlen={100}
                                autocomplete="street-address"
                                required={required}
                                disabled={!formDataState.member}
                                {...register('street')}
                            />
                            <Horizontal >
                                <InputPlz
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('plz')}
                                />
                                <Input
                                    label="Stadt"
                                    minlen={2}
                                    maxlen={50}
                                    autocomplete="address-level2"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('city')}
                                />
                            </Horizontal>
                            <Input
                                label="Telefon"
                                maxlen={50}
                                autocomplete="tel"
                                required={required}
                                disabled={!formDataState.member}
                                {...register('tel')}
                            />
                        </Vertical>

                        <h3 className="form-header">SEPA-Basislastschrift für wiederkehrende Zahlungen</h3>

                        <Vertical>
                            <Input
                                label="Kontoinhaber"
                                minlen={3}
                                maxlen={40}
                                autocomplete="cc-name"
                                required={required}
                                disabled={!formDataState.member}
                                {...register('accountowner')}
                            />
                            <Input
                                label="IBAN"
                                minlen={14}
                                maxlen={50}
                                autocomplete="payee-account-number"
                                required={required}
                                disabled={!formDataState.member}
                                validator={ibanValidator}
                                {...register('iban', (iban) => (electronicFormatIBAN(iban) ?? ''))}
                            />
                            <Horizontal>
                                <Input
                                    label="BIC"
                                    minlen={8}
                                    maxlen={11}
                                    autocomplete="payee-bank-code"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('bic')}
                                />
                                <Input
                                    label="Bank"
                                    minlen={3}
                                    maxlen={30}
                                    autocomplete="cc-type"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('bank')}
                                />
                            </Horizontal>
                            <Input
                                label="Kontoinhaber Strasse und Hausnummer"
                                minlen={3}
                                maxlen={100}
                                autocomplete="street-address"
                                required={required}
                                disabled={!formDataState.member}
                                {...register('accountownerStreet')}
                            />
                            <Horizontal>
                                <InputPlz
                                    label="Kontoinhaber PLZ"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('accountownerPlz')}
                                />
                                <Input
                                    minlen={2}
                                    label="Kontoinhaber Stadt"
                                    maxlen={50}
                                    autocomplete="address-level2"
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('accountownerCity')}
                                />
                            </Horizontal>
                        </Vertical>
                        <br/>
                        <Horizontal jc="flex-end">
                            <Button style="primary" type="submit" disabled={!isDirty} tabIndex={0}>
                                Speichern{!isDirty && <small> (Es gibt nichts zu speichern)</small>}
                            </Button>
                        </Horizontal>
                    </form>
                </WaitForIt>
            </Page>
        </LoggedInScope>
    </div>;
};