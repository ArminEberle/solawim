<template >
  <section class="solawim container px-0 mx-0">
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
    <b-form @submit.stop.prevent="handleSubmit(onSubmit)" @reset.stop.prevent="onReset">
      <div class="row">
        <validation-provider
          name="firstname"
          :rules="{ required: true, min: 3, max: 150 }"
          v-slot="validationContext"
        >
          <b-form-group label="Vorname" label-for="firstname">
            <b-form-input
              name="firstname"
              v-model="formdata.firstname"
              type="text"
              autocomplete="given-name"
              maxlength="150"
              :state="getValidationState(validationContext)"
              aria-describedby="firstname-feedback"
            />
            <b-form-invalid-feedback id="firstname-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </div>
      <div class="row">
        <validation-provider
          name="lastname"
          :rules="{ required: true, min: 3, max: 150 }"
          v-slot="validationContext"
        >
          <b-form-group label="Nachname" label-for="lastname">
            <b-form-input
              name="lastname"
              v-model="formdata.lastname"
              type="text"
              autocomplete="family-name"
              maxlength="150"
              :state="getValidationState(validationContext)"
              aria-describedby="lastname-feedback"
            />
            <b-form-invalid-feedback id="lastname-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </div>

      <div class="row">
        <validation-provider
          name="street"
          :rules="{ required: true, min: 3, max: 150 }"
          v-slot="validationContext"
        >
          <b-form-group label="Straße und Hausnummer" label-for="street">
            <b-form-input
              name="street"
              v-model="formdata.street"
              type="text"
              autocomplete="street-address"
              maxlength="150"
              :state="getValidationState(validationContext)"
              aria-describedby="street-feedback"
            />
            <b-form-invalid-feedback id="street-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </div>
      <div class="row">
        <validation-provider
          class="col-3"
          name="zip"
          :rules="{ required: true, min: 5, max: 5, numeric: true }"
          v-slot="validationContext"
        >
          <b-form-group label="PLZ" label-for="zip">
            <b-form-input
              name="zip"
              v-model="formdata.zip"
              type="text"
              autocomplete="postal-code"
              maxlength="5"
              :state="getValidationState(validationContext)"
              aria-describedby="zip-feedback"
            />
            <b-form-invalid-feedback id="zip-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider
          class="col-9"
          name="city"
          :rules="{ required: true, min: 3, max: 100 }"
          v-slot="validationContext"
        >
          <b-form-group
            label="Ort/Stadt/Gemeinde"
            label-for="city"
          >
            <b-form-input
              name="city"
              v-model="formdata.city"
              type="text"
              autocomplete="address-level2"
              maxlength="100"
              :state="getValidationState(validationContext)"
              aria-describedby="city-feedback"
            />
            <b-form-invalid-feedback id="city-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </div>

      <div class="row">
        <validation-provider
          name="phone"
          :rules="{ required: true, min: 8, max: 40 }"
          v-slot="validationContext"
        >
          <b-form-group label="Telefon" label-for="phone">
            <b-form-input
              name="phone"
              v-model="formdata.phone"
              type="text"
              autocomplete="tel"
              maxlength="40"
              :state="getValidationState(validationContext)"
              aria-describedby="phone-feedback"
            />
            <b-form-invalid-feedback id="phone-feedback">{{
              validationContext.errors[0]
            }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </div>

      <b-button type="submit" variant="primary">Speichern</b-button>
      <b-button type="reset" variant="secondary">Zurücksetzen</b-button>
    </b-form>
    </validation-observer>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getPersonData, setPersonData } from "../api";
import { PersonData } from "../structs/PersonData";
import { showToast } from '../utils/showToast';
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class PersonalDetailsForm extends Vue {
  formdata: PersonData = {
    lastname: "",
    firstname: "",
    street: "",
    zip: null,
    city: "",
    phone: "",
  };

  getValidationState({
    dirty,
    validated,
    valid = null,
  }: {
    dirty: boolean;
    validated: boolean;
    valid: any;
  }) {
    return dirty || validated ? valid : null;
  }

  created(): void {
    getPersonData()
      .then(personData => {
        Object.assign(this.formdata, personData);
      }).catch(e => showToast('Es gab ein Problem beim Laden der Daten vom Server: '+e));
  }

  onSubmit(): void {
    setPersonData(this.formdata)
      .then(() => showToast('Die Daten wurden gespeichert'))
      .catch(e => showToast('Es gab ein Problem beim Speichern der Daten am Server: '+e));
  }

  onReset(): boolean {
    if(!confirm('Wirklich zurücksetzen?')){
      return false;
    };
    setPersonData(null)
      .then(result => {
        this.formdata.lastname = '';
        this.formdata.firstname = '';
        this.formdata.street = '';
        this.formdata.zip = null;
        this.formdata.city = '';
        this.formdata.phone = '';
        showToast('Die Daten wurden gelöscht');
      }).catch(e => showToast('Es gab ein Problem beim Löschen der Daten vom Server: '+e));
    return true;
  }
}
</script>

<style lang="scss">
</style>
