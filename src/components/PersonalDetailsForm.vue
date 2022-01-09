<template >
  <div class="container" >
    <h2>Das bin ich</h2>
    <b-form>
      <div class="row">
        <b-form-group label="Vorname" label-for="firstname">
          <b-form-input
            name="firstname"
            v-model="formdata.firstname"
            type="text"
            autocomplete="given-name"
            maxlength="150"
            required
          />
          <b-form-valid-feedback />
        </b-form-group>
      </div>
      <div class="row">
        <b-form-group label="Nachname" label-for="lastname">
          <b-form-input
            name="lastname"
            v-model="formdata.lastname"
            type="text"
            autocomplete="family-name"
            maxlength="150"
            required
          />
        </b-form-group>
      </div>
      <div class="row">
        <b-form-group label="Straße und Hausnummer" label-for="street">
          <b-form-input
            name="street"
            v-model="formdata.street"
            type="text"
            autocomplete="street-address"
            maxlength="150"
            required
          />
        </b-form-group>
      </div>
      <div class="row">
        <b-form-group label="Postleitzahl" label-for="zip" class="col-3">
          <b-form-input
            name="zip"
            v-model="formdata.zip"
            type="text"
            autocomplete="postal-code"
            maxlength="5"
            required
          />
        </b-form-group>
        <b-form-group label="Ort/Stadt/Gemeinde" label-for="city" class="col-9">
          <b-form-input
            name="city"
            v-model="formdata.city"
            type="text"
            autocomplete="address-level2"
            maxlength="100"
            required
          />
        </b-form-group>
      </div>
      <div class="row">
        <b-form-group label="Telefon" label-for="phone">
          <b-form-input
            name="phone"
            v-model="formdata.phone"
            type="tel"
            autocomplete="tel"
            maxlength="20"
          />
        </b-form-group>
      </div>
      <b-button v-on:click="save" variant="primary">Speichern</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getPersonData, setPersonData } from "../api";
import { PersonData } from "../structs/PersonData";
import { showToast } from '../utils/showToast';

@Component({})
export default class PersonalDetailsForm extends Vue {
  formdata: PersonData = {
    lastname: "",
    firstname: "",
    street: "",
    zip: null,
    city: "",
    phone: "",
  };

  created(): void {
    getPersonData().then(personData => {
      Object.assign(this.formdata, personData);
    }).catch(e => {
      showToast('Es gab ein Problem beim Laden der Daten vom Server');
    });
  }

  save(): void {
    setPersonData(this.formdata).then(() => showToast('Die Daten wurden gespeichert'));
  }
}
</script>

<style lang="scss">
</style>
