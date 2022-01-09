<template>
  <div class="container">
    <h2>SEPA-Einzug</h2>
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" @reset.stop.prevent="onReset">
        <div class="row">
          <validation-provider
            name="iban"
            :rules="{ required: true, min: 22, max: 40, iban: true }"
            v-slot="validationContext"
          >
            <b-form-group label="IBAN" label-for="iban">
              <b-form-input
                name="iban"
                v-model="formdata.iban"
                type="text"
                autocomplete="payee-account-number"
                maxlength="40"
                :state="getValidationState(validationContext)"
                aria-describedby="iban-feedback"
              />
              <b-form-invalid-feedback id="iban-feedback">{{
                validationContext.errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>
        </div>
        <div class="row">
          <validation-provider
            name="bic"
            :rules="{ required: true, min: 3, max: 50 }"
            v-slot="validationContext"
          >
            <b-form-group label="BIC" label-for="bic">
              <b-form-input
                name="bic"
                v-model="formdata.bic"
                type="text"
                autocomplete="payee-bank-code"
                maxlength="100"
                :state="getValidationState(validationContext)"
                aria-describedby="bic-feedback"
              />
              <b-form-invalid-feedback id="bic-feedback">{{
                validationContext.errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>
        </div>
        <div class="row">
          <validation-provider
            name="bank"
            :rules="{ required: true, min: 3, max: 50 }"
            v-slot="validationContext"
          >
            <b-form-group label="Name der Bank" label-for="bank">
              <b-form-input
                name="bank"
                v-model="formdata.bank"
                type="text"
                autocomplete="cc-type"
                maxlength="100"
                :state="getValidationState(validationContext)"
                aria-describedby="bank-feedback"
              />
              <b-form-invalid-feedback id="bank-feedback">{{
                validationContext.errors[0]
              }}</b-form-invalid-feedback>
            </b-form-group>
          </validation-provider>
        </div>
        <div class="row">
          <validation-provider
            name="name"
            :rules="{ required: true, min: 3, max: 150 }"
            v-slot="validationContext"
          >
            <b-form-group label="Name des Kontoinhabers" label-for="firstname">
              <b-form-input
                name="name"
                v-model="formdata.name"
                type="text"
                autocomplete="cc-name"
                maxlength="150"
                :state="getValidationState(validationContext)"
                aria-describedby="name-feedback"
              />
              <b-form-invalid-feedback id="name-feedback">{{
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
            :rules="{ required: true, min: 5, max: 5 }"
            v-slot="validationContext"
          >
            <b-form-group label="Postleitzahl" label-for="zip" >
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
        <b-button type="submit" variant="primary">Speichern</b-button>
        <b-button type="reset" variant="secondary">Zurücksetzen</b-button>
      </b-form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ValidationProvider, ValidationObserver } from "vee-validate";
import { SepaData } from '../structs/SepaData';
import { showToast } from '../utils/showToast';
import { getSepaData, setSepaData } from '../api';

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class SepaForm extends Vue {
  formdata: SepaData = {
    iban: "",
    bank: "",
    bic: "",
    name: "",
    street: "",
    zip: null,
    city: "",
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
    getSepaData().then((data) => {
      Object.assign(this.formdata, data);
    }).catch(e => {
      showToast('Es gab ein Problem beim Laden der Daten vom Server: '+e);
    });
  }

  onSubmit(): void {
    setSepaData(this.formdata).then(result => {
      Object.assign(this.formdata, result);
      showToast('Die Daten wurden gespeichert');
    }).catch(e => {
      showToast('Es gab ein Problem beim Speichern der Daten: '+e);
    });
  }

  onReset(): boolean {
    if (!confirm("Wirklich zurücksetzen?")) {
      return false;
    }
    setSepaData(null).then(result => {
      this.formdata.iban = '';
      this.formdata.bank = '';
      this.formdata.bic = '';
      this.formdata.name = '';
      this.formdata.city = '';
      this.formdata.zip = null;
      this.formdata.street = '';
      showToast("Die Daten wurden gelöscht");
    }).catch(e => showToast('Es gab ein Problem bei Löschen der Daten: '+e));
    return true;
  }
}
</script>

<style lang="scss">
</style>
