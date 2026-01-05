import { electronicFormatIBAN } from 'ibantools';
import isEqual from 'lodash.isequal';
import toNumber from 'lodash/toNumber';
import { useState } from 'react';
import { getMyData } from 'src/api/getMyData';
import { setMyData as uploadMyData } from 'src/api/setMyData';
import { useGetCurrentSeason } from 'src/api/useGetSeasons';
import { Alert } from 'src/atoms/Alert';
import { showAlertWithBackdrop } from 'src/atoms/AlertWithBackdrop';
import { Button } from 'src/atoms/Button';
import { Checkbox } from 'src/atoms/Checkbox';
import { Input } from 'src/atoms/Input';
import { InputPlz } from 'src/atoms/InputPlz';
import { Select } from 'src/atoms/Select';
import { SolidaritaetSelect } from 'src/atoms/SolidaritaetSelect';
import { RootContext } from 'src/contexts/RootContext';
import { Horizontal } from 'src/layout/Horizontal';
import { Page } from 'src/layout/Page';
import { Vertical } from 'src/layout/Vertical';
import {
    MemberSelfManagementPageConditions,
    MemberSelfManagementPageInto,
    MemberSelfManagementPagePassiveHint,
    MemberSelfManagementPageYesIWant,
} from 'src/members/pages/member/MemberSelfManagementPageText';
import { MultiEmailInput } from 'src/members/pages/email/MultiEmailInput';
import { emptyMemberData } from 'src/members/types/MemberData';
import { LoggedInScope } from 'src/members/utils/LoggedInScope';
import { sanitizeAdditionalEmailReceipients } from 'src/members/utils/additionalEmailReceipients';
import { calculateMemberTotalSum } from 'src/members/utils/calculateMemberTotalSum';
import { calculatePositionPrice } from 'src/members/utils/calculatePositionPrice';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { WaitForIt } from 'src/utils/WaitForIt';
import { abholraumOptions } from 'src/utils/abholraumOptions';
import { amountsToBook } from 'src/utils/amountsToBook';
import { formMe } from 'src/utils/forms';
import { has } from 'src/utils/has';
import { prices } from 'src/utils/prices';
import { ibanValidator } from 'src/validators/ibanValidator';
import { MilchAnteilDistributionEditor } from 'src/molecules/MilchAnteilDistributionEditor';
import { defaultMilchAnteilDistribution } from 'src/members/types/MilchAnteilDistribution';

const required = true;

let globalDirty = false;

window.addEventListener('beforeunload', event => {
    if (globalDirty) {
        event.preventDefault();
        return (event.returnValue = '');
    }
    return null;
});

export const MemberSelfManagementPage = () => {
    return (
        <RootContext>
            <MemberSelfManagementPageInternal />
        </RootContext>
    );
};

export const MemberSelfManagementPageInternal = () => {
    const [serverState, setServerState] = useState(emptyMemberData());
    const [reloadState, setReloadState] = useState(true);
    const [isSavingState, setIsSavingState] = useState(false);

    const {
        handleSubmit,
        register,
        state: formDataState,
        setState: setFormDataState,
    } = formMe({
        data: emptyMemberData(),
        watch: data => {
            if (data.fleischMenge === '0' && data.milchMenge !== '0') {
                data.milchMenge = '0';
            }
        },
        onSubmit: async (data, setData) => {
            if (!has(data.abholraum)) {
                void showAlertWithBackdrop('Bitte wähle noch den Abholraum aus.');
                return;
            }
            setIsSavingState(true);
            try {
                const sanitizedData = {
                    ...data,
                    additionalEmailReceipients: sanitizeAdditionalEmailReceipients(
                        data.additionalEmailReceipients ?? [],
                    ),
                };
                await uploadMyData(sanitizedData);
                setData(sanitizedData);
                await showAlertWithBackdrop(
                    'Deine Daten sind jetzt gespeichert und werden so verwendet, wenn Du sie nicht mehr änderst.',
                );
                setReloadState(true);
            } finally {
                setIsSavingState(false);
            }
        },
    });

    const fetchFormData = async () => {
        const data = (await getMyData()) ?? emptyMemberData();
        if (!data.milchMenge) {
            data.milchMenge = '0';
        }
        if (!data.milchSolidar) {
            data.milchSolidar = '0';
        }
        data.useSepa = data.useSepa ?? true;
        data.additionalEmailReceipients = sanitizeAdditionalEmailReceipients(data.additionalEmailReceipients ?? []);
        setFormDataState({ ...data });
        setServerState({ ...data });
        setReloadState(false);
    };

    const season = useGetCurrentSeason();

    const abholraumClassName = formDataState.member && !has(formDataState.abholraum) ? 'red' : '';

    const isDirty = !isEqual(formDataState, serverState);
    globalDirty = isDirty;

    let activeMember = formDataState.active;

    // stopPropagation in next line is to prevent errors in elementor
    return (
        <div onKeyDown={e => e.stopPropagation()}>
            <LoggedInScope>
                <Page>
                    <WaitForIt
                        callback={fetchFormData}
                        redo={reloadState}
                    >
                        <MemberSelfManagementPageInto />
                        <MemberSelfManagementPageYesIWant />
                        <MemberSelfManagementPageConditions />
                        <MemberSelfManagementPagePassiveHint active={formDataState.active} />
                        <br />

                        {isDirty && (
                            <div>
                                <Alert>Bitte speichern (ganz unten) nicht vergessen</Alert>
                                <br />
                            </div>
                        )}
                        {!isDirty && (
                            <div>
                                <p className="alert">Diese Daten haben wir momentan von Dir gespeichert:</p>
                                <br />
                            </div>
                        )}

                        <form
                            className="pure-form"
                            onSubmit={handleSubmit}
                        >
                            <Horizontal jc="space-between">
                                <Checkbox {...register('member')}>
                                    Ja ich möchte dabei sein in der{' '}
                                    <b>
                                        Saison April {season} / März {season + 1}
                                    </b>
                                </Checkbox>
                                <Checkbox
                                    {...register('member')}
                                    negate={true}
                                >
                                    Nein, ich bin nicht dabei.
                                </Checkbox>
                            </Horizontal>

                            <br />

                            <h3>Deine Anteile</h3>
                            <Horizontal jc="flex-start">
                                <h3
                                    className="min-w-8 max-w-8"
                                    style={{ marginBottom: '6px', alignSelf: 'end' }}
                                >
                                    Brot
                                </h3>
                                <Select
                                    label="Anzahl"
                                    options={amountsToBook}
                                    required={required}
                                    disabled={!formDataState.member}
                                    maxWidth={6}
                                    {...register('brotMenge')}
                                />
                                {!activeMember && (
                                    <>
                                        <SolidaritaetSelect
                                            required={required}
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
                                                    amount: Number.parseInt(formDataState.brotMenge),
                                                    solidar: formDataState.brotSolidar,
                                                    price: prices[season].brot,
                                                }),
                                            )}
                                            disabled={true}
                                            maxlen={4}
                                            maxWidth={4}
                                            style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                                        />
                                    </>
                                )}
                            </Horizontal>

                            <Horizontal jc="flex-start">
                                <h3
                                    className="min-w-8 max-w-8"
                                    style={{ marginBottom: '6px', alignSelf: 'end' }}
                                >
                                    Fleisch / Käse
                                </h3>
                                <Select
                                    label="Anzahl"
                                    options={amountsToBook}
                                    required={required}
                                    disabled={!formDataState.member}
                                    maxWidth={6}
                                    {...register('fleischMenge')}
                                />

                                {!activeMember && (
                                    <>
                                        <SolidaritaetSelect
                                            required={required}
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
                                                    amount: Number.parseInt(formDataState.fleischMenge),
                                                    solidar: formDataState.fleischSolidar,
                                                    price: prices[season].fleisch,
                                                }),
                                            )}
                                            disabled={true}
                                            maxlen={4}
                                            maxWidth={4}
                                            style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                                        />
                                    </>
                                )}
                            </Horizontal>
                            {formDataState.member && toNumber(formDataState.fleischMenge) > 0 && (
                                <Horizontal>
                                    <div></div>
                                    <MilchAnteilDistributionEditor
                                        showInfo={true}
                                        value={
                                            formDataState.milchAnteilDistribution ?? defaultMilchAnteilDistribution()
                                        }
                                        onChange={newValue => {
                                            setFormDataState(prevState => ({
                                                ...prevState,
                                                milchAnteilDistribution: newValue,
                                            }));
                                        }}
                                        disabled={!formDataState.member || toNumber(formDataState.fleischMenge) === 0}
                                    />
                                </Horizontal>
                            )}
                            {!activeMember && formDataState.member && toNumber(formDataState.fleischMenge) > 0 && (
                                <Horizontal style={{ marginTop: '1rem' }}>
                                    <div></div>
                                    <Vertical>
                                        <b>Extra Milch</b>
                                        <Horizontal>
                                            <Select
                                                label="Liter/Woche"
                                                options={amountsToBook}
                                                maxWidth={6}
                                                required={required}
                                                disabled={
                                                    !formDataState.member || toNumber(formDataState.fleischMenge) === 0
                                                }
                                                {...register('milchMenge')}
                                            />
                                            <div
                                                style={{
                                                    alignSelf: 'flex-end',
                                                    paddingBottom: '1rem',
                                                    flexGrow: 1,
                                                }}
                                            >
                                                <small>
                                                    (nur zusammen mit Fleisch, keine Solidarmöglichkeit,{' '}
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
                                                        amount: Number.parseInt(formDataState.milchMenge ?? '0'),
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
                            )}

                            <Horizontal jc="flex-start">
                                <h3
                                    className="min-w-8 max-w-8"
                                    style={{ marginBottom: '6px', alignSelf: 'end' }}
                                >
                                    Gemüse
                                </h3>
                                <Select
                                    label="Anzahl"
                                    options={amountsToBook}
                                    maxWidth={6}
                                    required={required}
                                    disabled={!formDataState.member}
                                    {...register('veggieMenge')}
                                />
                                {!activeMember && (
                                    <>
                                        <SolidaritaetSelect
                                            required={required}
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
                                                    amount: Number.parseInt(formDataState.veggieMenge),
                                                    solidar: formDataState.veggieSolidar,
                                                    price: prices[season].veggie,
                                                }),
                                            )}
                                            disabled={true}
                                            maxlen={4}
                                            maxWidth={4}
                                            style={{ fontWeight: 'bold', textAlign: 'end', paddingRight: '1em' }}
                                        />
                                    </>
                                )}
                            </Horizontal>
                            <br />
                            {calculateMemberTotalSum(formDataState, season) > 0 && (
                                <p className="alert">
                                    In Summe werde ich dann ab April {season} bis einschließlich März {season + 1} zum
                                    Anfang jeden Monats{' '}
                                    <b>{calculateMemberTotalSum(formDataState, season)},-&nbsp;EUR</b> bezahlen.
                                </p>
                            )}
                            <br />
                            <p>Abholen möchte ich die Anteile dann wöchentlich im Abholraum:</p>
                            <Select
                                options={abholraumOptions}
                                required={required}
                                disabled={!formDataState.member}
                                className={abholraumClassName}
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
                                <Horizontal>
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
                                <MultiEmailInput
                                    label="Zusätzliche E-Mail-Empfänger*innen für Organisations-EMails"
                                    value={formDataState.additionalEmailReceipients ?? []}
                                    onChange={emails =>
                                        setFormDataState(current => ({
                                            ...current,
                                            additionalEmailReceipients: sanitizeAdditionalEmailReceipients(emails),
                                        }))
                                    }
                                    disabled={!formDataState.member}
                                    maxLength={500}
                                    name="additionalEmailReceipients"
                                    title="Mehrere E-Mail-Adressen durch Komma, Semikolon oder Zeilenumbruch trennen."
                                />
                                <br />
                                <Checkbox {...register('useSepa')}>
                                    Ich möchte über Lastschrifteinzugsverfahren bezahlen.
                                </Checkbox>
                                {!formDataState.useSepa && (
                                    <p>
                                        Wenn Du deinen Beitrag nicht über das Lastschriftverfahren bezahlen willst,
                                        sprich uns bitte direkt an, damit wir klären können wie die Alternative ist.
                                    </p>
                                )}
                                {formDataState.useSepa && (
                                    <>
                                        <h3 className="form-header">
                                            SEPA-Basislastschrift für wiederkehrende Zahlungen
                                        </h3>
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
                                            {...register('iban', iban => electronicFormatIBAN(iban) ?? '')}
                                        />
                                        <Horizontal>
                                            <Input
                                                label="BIC (Nur Großbuchstaben oder Ziffern, erste sechs Zeichen nur Großbuchstaben)"
                                                minlen={8}
                                                maxlen={11}
                                                pattern="^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$"
                                                // pattern="[A-Z]{6,6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3,3}){0,1}"
                                                title="Nur Großbuchstaben oder Ziffern, erste sechs Zeichen nur Großbuchstaben, mindestens 8, höchstens 11 Zeichen"
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
                    </WaitForIt>
                </Page>
            </LoggedInScope>
        </div>
    );
};
