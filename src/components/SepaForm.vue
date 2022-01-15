<template>
  <section class="solawim container px-0 mx-0">
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
      <b-form
        @submit.stop.prevent="handleSubmit(onSubmit)"
        @reset.stop.prevent="onReset"
      >
        <div class="row">
          <iban-field class="col-12" v-model="formdata.iban" />
        </div>
        <div class="row">
          <bic-field class="col-12" v-model="formdata.bic" />
        </div>
        <div class="row">
          <bankname-field class="col-12" v-model="formdata.bank" />
        </div>
        <div class="row">
          <account-holder-field class="col-12" v-model="formdata.name" />
        </div>
        <div class="row">
          <street-field v-model="formdata.street" class="col-12" />
        </div>
        <div class="row">
          <plz-field v-model="formdata.zip" class="col-3" />
          <city-field v-model="formdata.city" class="col-9" />
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
import { ValidationProvider, ValidationObserver } from "vee-validate";
import { SepaData } from "../structs/SepaData";
import { showToast } from "../utils/showToast";
import { getSepaData, setSepaData } from "../api";
import PlzField from "./fields/PlzField.vue";
import CityField from "./fields/CityField.vue";
import StreetField from "./fields/StreetField.vue";
import IbanField from "./fields/IbanField.vue";
import BicField from "./fields/BicField.vue";
import BanknameField from "./fields/BanknameField.vue";
import AccountHolderField from "./fields/AccountHolderField.vue";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
    PlzField,
    CityField,
    StreetField,
    IbanField,
    BicField,
    BanknameField,
    AccountHolderField
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
    getSepaData()
      .then((data) => {
        Object.assign(this.formdata, data);
      })
      .catch((e) => {
        showToast("Es gab ein Problem beim Laden der Daten vom Server: " + e);
      });
  }

  onSubmit(): void {
    setSepaData(this.formdata)
      .then((result) => {
        Object.assign(this.formdata, result);
        showToast("Die Daten wurden gespeichert");
      })
      .catch((e) => {
        showToast("Es gab ein Problem beim Speichern der Daten: " + e);
      });
  }

  onReset(): boolean {
    if (!confirm("Wirklich zurücksetzen?")) {
      return false;
    }
    setSepaData(null)
      .then((result) => {
        this.formdata.iban = "";
        this.formdata.bank = "";
        this.formdata.bic = "";
        this.formdata.name = "";
        this.formdata.city = "";
        this.formdata.zip = null;
        this.formdata.street = "";
        showToast("Die Daten wurden gelöscht");
      })
      .catch((e) =>
        showToast("Es gab ein Problem bei Löschen der Daten: " + e)
      );
    return true;
  }
}
</script>
