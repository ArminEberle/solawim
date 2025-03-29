import SEPA from 'sepa';
import { getBankingData } from 'src/api/getBankingData';
import type { AllMembersData } from 'src/members/types/AllMembersData';
import type { BankingData } from 'src/members/types/BankingData';
import { calculateMemberTotalSum } from 'src/members/utils/calculateMemberTotalSum';
import { calculatePositionSum } from 'src/members/utils/calculatePositionSum';
import { computeSepaMandateId } from 'src/members/utils/computeSepaMandateId';
import { download } from 'src/members/utils/download';
import { replaceCharsToSepaChars } from 'src/members/utils/replaceCharsToSepaChars';
import { findNextRemittanceDate } from 'src/utils/findNextRemittanceDate';
import { prices } from 'src/utils/prices';

export const createAndDownloadSepaFiles = async (memberData: AllMembersData, season: number): Promise<void> => {
    try {
        const bankingData = await getBankingData();
        if (!bankingData) {
            alert('Es gab ein Problem beim Herunterladen der Stammdaten. Siehe Server-Log.');
            return;
        }

        const summaryHeaders =
            'User-Id;Vorname;Nachname;Kontoinhaber;IBAN;BIC;Mandatsreferenz;Mandatsdatum;SEPA-End2EndId;Brot Betrag;Veggie Betrag;Fleisch Betrag;Milch Betrag;Gesamtbetrag;Fehler';

        const date = new Date();
        const monthPadded = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        const errorList: string[] = [];
        const transactionList: string[] = [];
        const excludedList: string[] = [];

        const fleischSepaDoc = createSepaDoc({
            year,
            monthPadded,
            bankingData,
            date,
            memberData,
            transactionList,
            errorList,
            sepaDocTopic: 'FM',
            season,
        });
        const brotSepaDoc = createSepaDoc({
            year,
            monthPadded,
            bankingData,
            date,
            memberData,
            transactionList,
            errorList,
            sepaDocTopic: 'B',
            season,
        });
        const veggieSepaDoc = createSepaDoc({
            year,
            monthPadded,
            bankingData,
            date,
            memberData,
            transactionList,
            errorList,
            sepaDocTopic: 'V',
            season,
        });

        fillTransactionList({
            year,
            monthPadded,
            memberData,
            transactionList,
            excludedList,
            season,
        });

        const errorCount = errorList.length;
        if (errorCount === 0) {
            errorList.push('KEINE');
        }

        const excludedCount = excludedList.length;
        if (excludedCount === 0) {
            excludedList.push('KEINE');
        }

        const summaryDoc = [
            summaryHeaders,
            ...transactionList,
            '',
            '',
            'Mitglieder ohne Lastschriftverfahren',
            '',
            ...excludedList,
            '',
            'Fehlerliste - Nicht enthalten in SEPA-Datei:',
            '',
            ...errorList,
        ].join('\r\n');

        download(`Solawi_Sammellastschrift_${year}_${monthPadded}_Fleisch_SEPA.xml`, fleischSepaDoc);
        download(`Solawi_Sammellastschrift_${year}_${monthPadded}_Brot_SEPA.xml`, brotSepaDoc);
        download(`Solawi_Sammellastschrift_${year}_${monthPadded}_Veggie_SEPA.xml`, veggieSepaDoc);

        const summaryFilename = `Solawi_Sammellastschrift_${year}_${monthPadded}_Uebersicht.csv`;
        download(summaryFilename, summaryDoc, 'text/csv');
        if (errorCount > 0) {
            alert(`Es gab ${errorCount} Fehler, siehe am Ende von Datei ${summaryFilename}`);
        }
    } catch (e) {
        alert('Ein Problem ist aufgetreten siehe console.log: ' + String(e));
        console.log(e);
    }
};

type SepaDocTopic = 'FM' | 'B' | 'V';

function createSepaDoc({
    year,
    monthPadded,
    bankingData,
    date,
    memberData,
    errorList,
    sepaDocTopic,
    season,
}: {
    year: number;
    monthPadded: string;
    bankingData: BankingData;
    date: Date;
    memberData: AllMembersData;
    transactionList: string[];
    errorList: string[];
    sepaDocTopic: SepaDocTopic;
    season: number;
}) {
    const debitId = `SOLAWI.${sepaDocTopic}.${String(year)}.${monthPadded}`;
    const creditorName = bankingData.holder; // 'Anbaustelle e.V.';
    const creditorId = bankingData.creditorId; // 'DE20ZZZ00002458365';
    const creditorIban = bankingData.iban; // 'DE94522500300050033976';
    const creditorBic = bankingData.bic; // 'HELADEF1ESW';
    const debitComment = 'SolaWi Beitrag ' + year + '.' + monthPadded;
    const doc = new SEPA.Document('pain.008.001.02');
    doc.grpHdr.id = debitId;
    doc.grpHdr.created = date;
    doc.grpHdr.initiatorName = creditorName;

    const info = doc.createPaymentInfo();
    info.collectionDate = findNextRemittanceDate(3, date);
    info.creditorIBAN = creditorIban.replace(/[ \t]/g, '');
    info.creditorBIC = creditorBic;
    info.creditorName = creditorName;
    info.creditorId = creditorId;
    info.sequenceType = 'RCUR';
    info.batchBooking = false; //optional

    doc.addPaymentInfo(info);

    for (const member of memberData) {
        const m = member.membership;
        if (!m?.member) {
            continue;
        }

        const mandateId = computeSepaMandateId(member);

        let topicNice = '';
        let amount: number;
        switch (sepaDocTopic) {
            case 'B':
                amount = calculatePositionSum({
                    amount: m.brotMenge,
                    solidar: m.brotSolidar,
                    price: prices[season].brot,
                });
                topicNice = 'Brot ' + amount.toFixed();
                break;
            case 'FM':
                const fleisch = calculatePositionSum({
                    amount: m.fleischMenge,
                    solidar: m.fleischSolidar,
                    price: prices[season].fleisch,
                });
                const milch = calculatePositionSum({
                    amount: m.milchMenge,
                    solidar: m.milchSolidar,
                    price: prices[season].milch,
                });

                amount = fleisch + milch;
                topicNice = `Fleisch ${fleisch.toFixed()} und Milch ${milch.toFixed()}`;
                break;
            case 'V':
                amount = calculatePositionSum({
                    amount: m.veggieMenge,
                    solidar: m.veggieSolidar,
                    price: prices[season].veggie,
                });
                topicNice = 'Veggie ' + amount.toFixed();
                break;
        }
        if (amount <= 0) {
            continue;
        }

        const verwendungszweck = `${debitComment} ${replaceCharsToSepaChars(m.firstname)} ${replaceCharsToSepaChars(m.lastname)} ${topicNice}`;
        const end2EndId = mandateId + '.' + year + '.' + monthPadded;

        let tx;

        const reportRow = `${member.id};${m.firstname};${m.lastname};${m.accountowner};${m.iban};${m.bic};${mandateId};${m.mandateDate};${end2EndId};${topicNice};${amount}`;

        if (m.useSepa ?? true) {
            tx = info.createTransaction();
            tx.debtorName = replaceCharsToSepaChars(m.accountowner).substring(0, 70);
            tx.debtorIBAN = m.iban.replace(/[ \t]/g, '');
            tx.debtorBIC = m.bic;
            tx.mandateId = mandateId;
            tx.mandateSignatureDate = new Date(m.mandateDate as string);
            tx.amount = amount;
            tx.currency = 'EUR';
            tx.remittanceInfo = verwendungszweck;
            tx.end2endId = end2EndId;
            try {
                tx.validate();
                info.addTransaction(tx);
            } catch (e) {
                const msg = `${reportRow};${e}`;
                errorList.push(msg);
                console.log(msg);
            }
        }
    }
    const sepaDoc = doc.toString().replace('encoding="null"', 'encoding="UTF-8"');
    return sepaDoc;
}

function fillTransactionList({
    year,
    monthPadded,
    memberData,
    transactionList,
    excludedList,
    season,
}: {
    year: number;
    monthPadded: string;
    memberData: AllMembersData;
    transactionList: string[];
    excludedList: string[];
    season: number;
}) {
    for (const member of memberData) {
        const m = member.membership;
        if (!m?.member) {
            continue;
        }

        const brot = calculatePositionSum({
            amount: m.brotMenge,
            solidar: m.brotSolidar,
            price: prices[season].brot,
        });
        const veggie = calculatePositionSum({
            amount: m.veggieMenge,
            solidar: m.veggieSolidar,
            price: prices[season].veggie,
        });
        const fleisch = calculatePositionSum({
            amount: m.fleischMenge,
            solidar: m.fleischSolidar,
            price: prices[season].fleisch,
        });
        const milch = calculatePositionSum({
            amount: m.milchMenge,
            solidar: m.milchSolidar,
            price: prices[season].milch,
        });

        const amount = calculateMemberTotalSum(m, season);
        if (amount <= 0) {
            continue;
        }

        const mandateId = computeSepaMandateId(member);
        const brotBetrag = brot.toFixed();
        const veggieBetrag = veggie.toFixed();
        const fleischBetrag = fleisch.toFixed();
        const milchBetrag = milch.toFixed();
        const end2EndId = mandateId + '.' + year + '.' + monthPadded;

        const reportRow = `${member.id};${m.firstname};${m.lastname};${m.accountowner};${m.iban};${m.bic};${mandateId};${m.mandateDate};${end2EndId};${brotBetrag};${veggieBetrag};${fleischBetrag};${milchBetrag};${amount}`;

        if (m.useSepa ?? true) {
            transactionList.push(reportRow);
        } else {
            excludedList.push(reportRow);
        }
    }
}
