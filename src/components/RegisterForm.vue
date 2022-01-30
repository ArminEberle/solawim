<template>
  <section class="solawim container px-0 mx-0 m-y-5">
    <h3>Du willst Mitglied werden?</h3>
    <p>
      Der erste Schritt ist, dass Du dich mit deiner gültigen Email-Adresse
      registrierst. Das ist noch keine Mitgliedschaft, Du erhältst aber Zugang
      zum Forum und kannst auf dieser Seite dann eintragen, wieviele Anteile Du
      übernehmen willst.
    </p>
    <p class="my-5 d-flex">
      <a class="btn w-100 text-center" href="/community/registrieren">Zum Registrieren geht's hier lang.</a>
    </p>
    <p>Wenn Du dich schon registriert hast, melde dich bitte erst an oder stell dein Passwort wieder her,
      falls Du es vergessen hast:</p>
    <p class="my-5 d-flex">
      <a class="btn w-100 text-center" :href="loginlink">Login / Passwort wiederherstellen</a>
    </p>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class RegisterForm extends Vue {
  get loginlink() {
    return `/anmelden?redirect_to=${window.location.pathname}`;
  }
}
</script>
