<template>
  <div class="container">
    <h2>SEPA-Einzug</h2>
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
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
                autocomplete="cc-number"
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
                v-model="formdata.firstname"
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
            name="zip"
            :rules="{ required: true, min: 5, max: 5 }"
            v-slot="validationContext"
          >
            <b-form-group label="Postleitzahl" label-for="zip" class="col-3">
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
            name="city"
            :rules="{ required: true, min: 3, max: 100 }"
            v-slot="validationContext"
          >
            <b-form-group
              label="Ort/Stadt/Gemeinde"
              label-for="city"
              class="col-9"
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
      </b-form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ValidationProvider, ValidationObserver } from "vee-validate";

export type SepaDetails = {
  iban: string;
  bank: string;
  name: string;
  street: string;
  zip: string;
  city: string;
};

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class SepaForm extends Vue {
  formdata: SepaDetails = {
    iban: "",
    bank: "",
    name: "",
    street: "",
    zip: "",
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

  onSubmit(): void {
    console.log(JSON.stringify(this.formdata, null, 2));
  }
}
</script>

<style lang="scss">
</style>
