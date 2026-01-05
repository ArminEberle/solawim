import { electronicFormatIBAN } from 'ibantools';
import isEqual from 'lodash.isequal';
import toNumber from 'lodash/toNumber';
import { useMemo, useState } from 'react';
import { Button } from 'src/atoms/Button';
import { Checkbox } from 'src/atoms/Checkbox';
import { Input } from 'src/atoms/Input';
import { InputPlz } from 'src/atoms/InputPlz';
import { useSeason } from 'src/atoms/SeasonSelect';
import { Select } from 'src/atoms/Select';
import { SolidaritaetSelect } from 'src/atoms/SolidaritaetSelect';
import { Horizontal } from 'src/layout/Horizontal';
import { Vertical } from 'src/layout/Vertical';
import { MultiEmailInput } from 'src/members/pages/email/MultiEmailInput';
import { MemberData, emptyMemberData } from 'src/members/types/MemberData';
import { defaultMilchAnteilDistribution } from 'src/members/types/MilchAnteilDistribution';
import { sanitizeAdditionalEmailReceipients } from 'src/members/utils/additionalEmailReceipients';
import { calculateMemberTotalSum } from 'src/members/utils/calculateMemberTotalSum';
import { calculatePositionPrice } from 'src/members/utils/calculatePositionPrice';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { MilchAnteilDistributionEditor } from 'src/molecules/MilchAnteilDistributionEditor';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { amountsToBook } from 'src/utils/amountsToBook';
import { formMe } from 'src/utils/forms';
import { prices } from 'src/utils/prices';
import { ibanValidator } from 'src/validators/ibanValidator';

export type MemberEditProps = {
    data: MemberData | undefined;
    onSave: (newData: MemberData) => unknown;
    required: boolean;
};

export const MemberEditMolecule = (props: MemberEditProps) => {
    const initialData = useMemo(() => props.data ?? emptyMemberData(), [props.data]);

    const season = useSeason();
    const [isSavingState, setIsSavingState] = useState(false);

    initialData.useSepa = initialData.useSepa ?? true;
    const {
        handleSubmit,
        register,
        state: formDataState,
        setState,
    } = formMe({
        data: initialData,
        onSubmit: async (data, setData) => {
            setIsSavingState(true);
            try {
                const sanitized: MemberData = {
                    ...data,
                    additionalEmailReceipients: sanitizeAdditionalEmailReceipients(
                        data.additionalEmailReceipients ?? [],
                    ),
                };
                await props.onSave(sanitized);
                setData(sanitized);
            } finally {
                setIsSavingState(false);
            }
        },
    });
    const isDirty = !isEqual(initialData, formDataState);
    const updateAdditionalEmailReceipients = (emails: string[]) => {
        const sanitized = sanitizeAdditionalEmailReceipients(emails);
        setState(current => ({
            ...current,
            additionalEmailReceipients: sanitized,
        }));
    };

    return (
        <form
            className="pure-form"
            onSubmit={handleSubmit}
        >
            <Horizontal jc="space-between">
                <Checkbox {...register('member')}>
                    Ja ich möchte dabei sein in der Saison April {season} / März {season + 1}
                </Checkbox>
                <Checkbox
                    {...register('member')}
                    negate={true}
                >
                    Nein, ich bin nicht dabei.
                </Checkbox>
            </Horizontal>
            <Horizontal jc="space-between">
                <Checkbox
                    {...register('active')}
                    negate={false}
                >
                    Arbeit gegen Anteile
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
                <div
                    style={{
                        alignSelf: 'flex-end',
                        paddingBottom: '1rem',
                        flexGrow: 1,
                    }}
                >
                    <small>
                        (
                        {calculatePositionPrice({
                            price: prices[season].brot,
                            solidar: formDataState.brotSolidar,
                        })}{' '}
                        EUR / pro Anteil)
                    </small>
                </div>
                <Input
                    label="Summe"
                    value={String(
                        calculatePositionSum({
                            amount: formDataState.brotMenge,
                            solidar: formDataState.brotSolidar,
                            price: prices[season].brot,
                        }),
                    )}
                    disabled={true}
                    maxlen={4}
                    maxWidth={4}
                    style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                />
            </Horizontal>

            <Horizontal>
                <h3 className="min-w-8 max-w-8">Fleisch / Käse</h3>
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
                <div
                    style={{
                        alignSelf: 'flex-end',
                        paddingBottom: '1rem',
                        flexGrow: 1,
                    }}
                >
                    <small>
                        (
                        {calculatePositionPrice({
                            price: prices[season].fleisch,
                            solidar: formDataState.fleischSolidar,
                        })}{' '}
                        EUR / pro Anteil)
                    </small>
                </div>
                <Input
                    label="Summe"
                    value={String(
                        calculatePositionSum({
                            amount: formDataState.fleischMenge,
                            solidar: formDataState.fleischSolidar,
                            price: prices[season].fleisch,
                        }),
                    )}
                    disabled={true}
                    maxlen={4}
                    maxWidth={4}
                    style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                />
            </Horizontal>
            <Horizontal>
                <div></div>
                <Vertical style={{ marginTop: '1rem' }}>
                    <MilchAnteilDistributionEditor
                        showInfo={false}
                        value={formDataState.milchAnteilDistribution ?? defaultMilchAnteilDistribution()}
                        disabled={!formDataState.member || toNumber(formDataState.fleischMenge) === 0}
                        onChange={newValue => {
                            setState(prevState => ({
                                ...prevState,
                                milchAnteilDistribution: newValue,
                            }));
                        }}
                    />
                    <Horizontal style={{ marginTop: '1rem' }}>
                        <h4 className="min-w-8 max-w-8">Milch</h4>
                        <Select
                            label="Anzahl / Liter"
                            options={amountsToBook}
                            maxWidth={6}
                            required={props.required}
                            disabled={!formDataState.member || toNumber(formDataState.fleischMenge) <= 0}
                            {...register('milchMenge')}
                        />
                        <SolidaritaetSelect
                            required={props.required}
                            disabled={!formDataState.member || toNumber(formDataState.fleischMenge) <= 0}
                            {...register('milchSolidar')}
                        />
                        <div
                            style={{
                                alignSelf: 'flex-end',
                                paddingBottom: '1rem',
                                flexGrow: 1,
                            }}
                        >
                            <small>
                                (
                                {calculatePositionPrice({
                                    price: prices[season].milch,
                                    solidar: formDataState.milchSolidar,
                                })}{' '}
                                EUR / pro Anteil)
                            </small>
                        </div>
                        <Input
                            label="Summe"
                            value={String(
                                calculatePositionSum({
                                    amount: formDataState.milchMenge,
                                    solidar: formDataState.milchSolidar,
                                    price: prices[season].milch,
                                }),
                            )}
                            disabled={true}
                            maxlen={4}
                            maxWidth={4}
                            style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                        />
                    </Horizontal>
                </Vertical>
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
                <div
                    style={{
                        alignSelf: 'flex-end',
                        paddingBottom: '1rem',
                        flexGrow: 1,
                    }}
                >
                    <small>
                        (
                        {calculatePositionPrice({
                            price: prices[season].veggie,
                            solidar: formDataState.veggieSolidar,
                        })}{' '}
                        EUR / pro Anteil)
                    </small>
                </div>
                <Input
                    label="Summe"
                    value={String(
                        calculatePositionSum({
                            amount: formDataState.veggieMenge,
                            solidar: formDataState.veggieSolidar,
                            price: prices[season].veggie,
                        }),
                    )}
                    disabled={true}
                    maxlen={4}
                    maxWidth={4}
                    style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                />
            </Horizontal>
            <br />
            {calculateMemberTotalSum(formDataState, season) > 0 && (
                <p className="alert">
                    In Summe werde ich dann ab April {season} bis einschließlich März {season + 1} zum Anfang jeden
                    Monats <b>{calculateMemberTotalSum(formDataState, season)},-&nbsp;EUR</b> bezahlen.
                </p>
            )}
            <br />
            <p>Abholen möchte ich die Anteile dann wöchentlich im Abholraum:</p>
            <Select
                options={abholraumOptions}
                required={props.required}
                disabled={!formDataState.member}
                {...register('abholraum')}
            />

            <h3 className="form-header">Deine Person</h3>
            <Vertical>
                <Horizontal>
                    <Input
                        label="Vorname"
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
                <Horizontal>
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
                <MultiEmailInput
                    label="Zusätzliche E-Mail-Empfänger*innen"
                    value={formDataState.additionalEmailReceipients ?? []}
                    onChange={updateAdditionalEmailReceipients}
                    disabled={!formDataState.member}
                    maxLength={500}
                    name="additionalEmailReceipients"
                    title="Mehrere E-Mail-Adressen durch Komma, Semikolon oder Zeilenumbruch trennen."
                />
            </Vertical>

            <h3 className="form-header">SEPA-Basislastschrift für wiederkehrende Zahlungen</h3>

            <Vertical>
                <Checkbox {...register('useSepa')}>Ja ich möchte am Lastschriftverfahren teilnehmen.</Checkbox>
                {formDataState.useSepa && (
                    <>
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
                            {...register('iban', iban => electronicFormatIBAN(iban) ?? '')}
                        />
                        <Horizontal>
                            <Input
                                label="BIC"
                                minlen={8}
                                maxlen={11}
                                pattern="[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}"
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
                    </>
                )}
            </Vertical>
            <br />
            <Horizontal jc="flex-end">
                <Button
                    buttonType="primary"
                    type="submit"
                    disabled={!isDirty}
                    tabIndex={0}
                >
                    Speichern{!isDirty && <small> (Es gibt nichts zu speichern)</small>}
                    {isSavingState && <div className="mini-spinner"></div>}
                </Button>
            </Horizontal>
        </form>
    );
};
