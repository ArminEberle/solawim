import React from 'react';
import { ButtonLink } from 'src/atoms/ButtonLink';
import { Page } from 'src/layout/Page';

export const LoginPage = () => {
    return <Page>
        <h3>
      Du willst Mitglied werden?
        </h3>
        <p>
      Der erste Schritt ist, dass Du dich mit deiner gültigen Email-Adresse registrierst.
      Das ist noch keine Mitgliedschaft,
      Du erhältst aber Zugang zum Forum und kannst auf dieser Seite dann eintragen,
      wieviele Anteile Du übernehmen willst.
        </p>
        <ButtonLink buttonType="primary" href="/anmelden/?action=register">Zum Registrieren geht's hier lang.</ButtonLink>
        <br/>
        <p>
      Wenn Du dich schon registriert hast, melde dich bitte erst an:
        </p>
        <ButtonLink buttonType="primary" href="/anmelden/?redirect_to=/mitgliedsantrag">Login</ButtonLink>
        <br/>
        <p>
       ...oder stell dein Passwort wieder her, falls Du es vergessen hast:
        </p>
        <ButtonLink buttonType="primary" href="/anmelden/?action=lostpassword">Ich habe mein Passwort vergessen.</ButtonLink>
    </Page>;
};