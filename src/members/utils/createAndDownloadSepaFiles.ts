import { AllMembersData } from "src/members/types/AllMembersData";
import { calculateMemberTotalSum } from "src/members/utils/calculateMemberTotalSum";
import SEPA from 'sepa';
import { calculatePositionSum } from "src/members/utils/calculatePositionSum";
import { prices } from "src/utils/prices";
import { download } from "src/members/utils/download";
import { getBankingData } from "src/api/getBankingData";

export const createAndDownloadSepaFiles = async(memberData: AllMembersData): Promise<void> => {
    const bankingData = await getBankingData();
    if(!bankingData) {
        alert('Es gab ein Problem beim Herunterladen der Stammdaten.');
        return;
    } 

    const date = new Date();
    const monthPadded = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const debitId = 'SOLAWI_' + String(year) + '_' + monthPadded;
    const creditorName = bankingData.holder; // 'Anbaustelle e.V.';
    const creditorId = bankingData.creditorId; // 'DE20ZZZ00002458365';
    const creditorIban = bankingData.iban; // 'DE94522500300050033976';
    const creditorBic = bankingData.bic; // 'HELADEF1ESW';
    const debitComment = 'SolaWi Beitrag ' + year + '_' + monthPadded;

    const doc = new SEPA.Document('pain.008.001.02');
    doc.grpHdr.id = debitId;
    doc.grpHdr.created = date;
    doc.grpHdr.initiatorName = creditorName;

    const errorList: string[] = [];
    const transactionList: string[] = [];

    const info = doc.createPaymentInfo();
    info.collectionDate = date;
    info.creditorIBAN = creditorIban;
    info.creditorBIC = creditorBic;
    info.creditorName = creditorName;
    info.creditorId = creditorId;
    info.batchBooking = true; //optional
    doc.addPaymentInfo(info);

    const summaryHeaders = `User-Id;Vorname;Nachname;Kontoinhaber;IBAN;BIC;Mandatsreferenz;Mandatsdatum;SEPA-End2EndId;Brot Betrag;Veggie Betrag;Fleisch Betrag;Gesamtbetrag;Fehler`;

    for (const member of memberData) {
        const m = member.membership;
        if (!m?.member) {
            continue;
        }

        const brot = calculatePositionSum({
            amount: m.brotMenge,
            solidar: m.brotSolidar,
            price: prices.brot,
        });
        const veggie = calculatePositionSum({
            amount: m.veggieMenge,
            solidar: m.veggieSolidar,
            price: prices.veggie,
        });
        const fleisch = calculatePositionSum({
            amount: m.fleischMenge,
            solidar: m.fleischSolidar,
            price: prices.fleisch,
        })

        const amount = calculateMemberTotalSum(m);
        if (amount <= 0) {
            { }
            continue;
        }

        const mandateId = "SOLAWI.2023." + member.id;
        const brotBetrag = brot.toFixed();
        const veggieBetrag = veggie.toFixed();
        const fleischBetrag = fleisch.toFixed();
        const verwendungszweck = `${debitComment} ${m.firstname} ${m.lastname} b ${brotBetrag} g ${veggieBetrag} f ${fleischBetrag}`;
        const end2EndId = mandateId + '.' + year + '.' + monthPadded;

        const tx = info.createTransaction();
        tx.debtorName = m.accountowner;
        tx.debtorIBAN = m.iban;
        tx.debtorBIC = m.bic;
        tx.mandateId = mandateId;
        tx.mandateSignatureDate = new Date(m.mandateDate as string);
        tx.amount = amount;
        tx.currency = 'EUR';
        tx.remittanceInfo = verwendungszweck;
        tx.end2endId = end2EndId;

        const reportRow = `${member.id};${m.firstname};${m.lastname};${m.accountowner};${m.iban};${m.bic};${mandateId};${m.mandateDate};${end2EndId};${brotBetrag};${veggieBetrag};${fleischBetrag};${amount}`;
        try {
            tx.validate()
            info.addTransaction(tx);
            transactionList.push(reportRow)
        } catch (e) {
            const msg = `${reportRow};${e}`;
            errorList.push(msg);
            console.log(msg);
        }
    }
    const sepaDoc = doc.toString().replace('encoding="null"', 'encoding="UTF-8"');

    const errorCount = errorList.length;
    if (errorCount === 0) {
        errorList.push('KEINE');
    }

    const summaryDoc = [summaryHeaders, ...transactionList, '', '', 'Fehlerliste - Nicht enthalten in SEPA-Datei:', '', ...errorList].join('\r\n');

    download(`Solawi_Sammellastschrift_${year}_${monthPadded}_SEPA.xml`,
        sepaDoc
    );

    const summaryFilename = `Solawi_Sammellastschrift_${year}_${monthPadded}_Uebersicht.csv`;
    download(summaryFilename, summaryDoc, 'text/csv');
    if (errorCount > 0) {
        alert(`Es gab ${errorCount} Fehler, siehe am Ende von Datei ${summaryFilename}`);
    }
}
