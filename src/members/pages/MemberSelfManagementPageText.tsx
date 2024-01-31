import React from 'react';
import { useGetSeasons } from 'src/api/useGetSeasons';

export const MemberSelfManagementPageInto = () =>
    <section>
        <h3>Hallo, schön dass Du in der Kollektiv Solawi Mitglied werden möchtest oder schon bist!</h3>
        <p>
            Mit deinem Beitreten wirst du Teil von unserem Verein.
            Dein Mitgliedsbeitrag entspricht deinem Anteil an produzierten Gütern.
        </p><p>
            Wir haben uns für ein gestaffeltes Solidarprinzip entschieden.
            Der normale Richtwert entspricht dem errechneten Wert,
            den es im Durchschnitt braucht um die gesamten Kosten, von Pacht, Löhnen, Nebenkosten und Maschinen
            für alle produzierten Lebensmittel zu decken.
        </p><p>
            Wenn Du dich für den erhöhten Solibeitrag entscheidest,
            ermöglichst du es einem anderen Menschen einen ermäßigten Anteil zu bekommen.
            Für diesen ermäßigten Beitrag gibt es keine Kriterien.
        </p><p>
            Allerdings wünschen wir uns, dass einkommensstarke Mitglieder Menschen
            mit strukturschwachem Hintergrund unterstützen und ihnen damit den Zugang zu gesunden,
            regionalen Biolebensmitteln ermöglichen.
        </p>
    </section>;

export const MemberSelfManagementPageYesIWant = () =>
    <section>
        <p>
            Zur Auswahl stehen Dir dieses Jahr 3 verschiedene Anteilsoptionen.
        </p><p>
            Der Umfang eines ganzen Anteils ist für den wöchentlichen Konsum
            von ein bis zwei ausgewachsenen Menschen errechnet.
            Wenn ihr mehr seid, wählt einfach zusätzliche Anteile aus.
        </p><p>
            Diese werden dann wöchentlich (bis auf Fleisch) in den von euch gewählten Abholraum geliefert.
        </p><p>
            Bitte beachtet die jeweils ausgehängten Informationen zu Haltbarkeit und Verarbeitung.
        </p>
    </section>;

export const MemberSelfManagementPageConditions = () =>
    <section>
        <h3>
            Bezahlung und Kündigung
        </h3>
        <p>
            Mit dem Speichern erklärst Du dich vertraglich gebunden.
        </p><p>
            Mit dem Absenden Deines Mitgliedsantrages erteilst Du uns auch ein SEPA-Lastschriftmandat,
            über das der von dir gewählte Beitrag monatlich abgebucht werden kann (Am Anfang jedes Monats).
        </p><p>
            Prinzipiell wirst Du für ein Jahr Mitglied. Um eine langfristige Planungssicherheit zu gewährleisten,
            bitten wir Dich, bis 1. Januar des Folgejahres via E-Mail zu kündigen (siehe 'Kontakt').
        </p><p>
            Zu einem späteren Zeitpunkt sind auch individuelle Lösungen nach Absprachen möglich,
            sollte sich bei euch etwas grundlegend verändert haben.
        </p>
    </section>;

export const MemberSelfManagementPagePassiveHint = () =>
    <section>
        <p>
            Du wirst als passives Mitglied geführt. Wenn du dich aktiv an der Hofarbeit, Gremien und/oder Aktionen
            beteiligen willst, melde Dich bei uns.
        </p>

    </section>;