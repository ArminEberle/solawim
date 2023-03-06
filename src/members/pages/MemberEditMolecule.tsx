import { electronicFormatIBAN } from "ibantools";
import React from "react";
import { Button } from "src/atoms/Button";
import { Checkbox } from "src/atoms/Checkbox";
import { Input } from "src/atoms/Input";
import { InputPlz } from "src/atoms/InputPlz";
import { Select } from "src/atoms/Select";
import { SolidaritaetSelect } from "src/atoms/SolidaritaetSelect";
import { Horizontal } from "src/layout/Horizontal";
import { Vertical } from "src/layout/Vertical";
import { SingleMemberData } from "src/members/types/AllMembersData"
import { emptyMemberData, MemberData } from "src/members/types/MemberData";
import { calculateMemberTotalSum } from "src/members/utils/calculateMemberTotalSum";
import { calculatePositionPrice } from "src/members/utils/calculatePositionPrice";
import { calculatePositionSum } from "src/members/utils/calculatePositionSum";
import { abholraumOptions } from "src/utils/abholraumOptions";
import { amountsToBook } from "src/utils/amountsToBook";
import { formMe } from "src/utils/forms";
import { prices } from "src/utils/prices";
import { ibanValidator } from "src/validators/ibanValidator";
import isEqual from 'lodash.isequal';


export type MemberEditProps = {
    data: MemberData | undefined;
    onSave: (newData: MemberData) => unknown;
    required: boolean;
}

export const MemberEditMolecule = (props: MemberEditProps) => {
    const initialData = props.data ?? emptyMemberData();
    const {
        handleSubmit,
        register,
        state: formDataState,
        setState: setFormDataState,
    } = formMe({
        data: initialData,
        onSubmit: async(data, setData) => {
            await props.onSave(data);
            setData(data);
            console.log('It is done', data);
        },
    });
    const isDirty = !isEqual(initialData, formDataState);

    return <form className="pure-form" onSubmit={handleSubmit}>
        <Horizontal jc="space-between">
            <Checkbox {...register('member')}>
                Ja ich möchte dabei sein in der Saison April 2023 / März 2024
            </Checkbox>
            <Checkbox {...register('member')} negate={true}>
                Nein, ich bin nicht dabei.
            </Checkbox>
        </Horizontal>

        <br />

        <h3>Deine Anteile</h3>

        <Horizontal>
            <h3 className="min-w-8 max-w-8">Brot</h3>
            <Select
                label="Anzahl"
                options={amountsToBook}
                required={props.required}
                disabled={!formDataState.member}
                maxWidth={6}
                {...register('brotMenge')}
            />
            <SolidaritaetSelect
                required={props.required}
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
                options={amountsToBook}
                maxWidth={6}
                required={props.required}
                disabled={!formDataState.member}
                {...register('fleischMenge')}
            />
            <SolidaritaetSelect
                required={props.required}
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
                required={props.required}
                disabled={!formDataState.member}
                {...register('veggieMenge')}
            />
            <SolidaritaetSelect
                required={props.required}
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
        <br />
        {calculateMemberTotalSum(formDataState) > 0
            && <p className="alert">
                In Summe werde ich dann ab April 2023 bis einschließlich März 2024 zum Anfang jeden
                Monats <b>{calculateMemberTotalSum(formDataState)},-&nbsp;EUR</b> bezahlen.
            </p>
        }
        <br />
        <p>
            Abholen möchte ich die Anteile dann wöchentlich im Abholraum:
        </p>
        <Select
            options={abholraumOptions}
            required={props.required}
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
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('firstname')}
                />
                <Input
                    label="Nachame"
                    minlen={3}
                    maxlen={50}
                    autocomplete="family-name"
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('lastname')}
                />
            </Horizontal>
            <Input
                label="Strasse und Hausnummer"
                minlen={3}
                maxlen={100}
                autocomplete="street-address"
                required={props.required}
                disabled={!formDataState.member}
                {...register('street')}
            />
            <Horizontal >
                <InputPlz
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('plz')}
                />
                <Input
                    label="Stadt"
                    minlen={2}
                    maxlen={50}
                    autocomplete="address-level2"
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('city')}
                />
            </Horizontal>
            <Input
                label="Telefon"
                maxlen={50}
                autocomplete="tel"
                required={props.required}
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
                required={props.required}
                disabled={!formDataState.member}
                {...register('accountowner')}
            />
            <Input
                label="IBAN"
                minlen={14}
                maxlen={50}
                autocomplete="payee-account-number"
                required={props.required}
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
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('bic')}
                />
                <Input
                    label="Bank"
                    minlen={3}
                    maxlen={30}
                    autocomplete="cc-type"
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('bank')}
                />
            </Horizontal>
            <Input
                label="Kontoinhaber Strasse und Hausnummer"
                minlen={3}
                maxlen={100}
                autocomplete="street-address"
                required={props.required}
                disabled={!formDataState.member}
                {...register('accountownerStreet')}
            />
            <Horizontal>
                <InputPlz
                    label="Kontoinhaber PLZ"
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('accountownerPlz')}
                />
                <Input
                    minlen={2}
                    label="Kontoinhaber Stadt"
                    maxlen={50}
                    autocomplete="address-level2"
                    required={props.required}
                    disabled={!formDataState.member}
                    {...register('accountownerCity')}
                />
            </Horizontal>
        </Vertical>
        <br />
        <Horizontal jc="flex-end">
            <Button buttonType="primary" type="submit" disabled={!isDirty} tabIndex={0}>
                Speichern{!isDirty && <small> (Es gibt nichts zu speichern)</small>}
            </Button>
        </Horizontal>
    </form>
}