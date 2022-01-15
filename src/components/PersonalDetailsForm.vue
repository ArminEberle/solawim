<template >
  <section class="solawim container px-0 mx-0">
    <validation-observer ref="observer" v-slot="{ handleSubmit }">
    <b-form @submit.stop.prevent="handleSubmit(onSubmit)" @reset.stop.prevent="onReset">
      <div class="row">
        <name-field label="Vorname(n)" autocomplete="given-name" v-model="formdata.firstname" class="col-12" />
      </div>
      <div class="row">
        <name-field label="Nachname(n)" autocomplete="family-name" v-model="formdata.lastname" class="col-12" />
      </div>
      <div class="row">
        <street-field v-model="formdata.street" class="col-12" />
      </div>
      <div class="row">
        <plz-field v-model="formdata.zip" class="col-3" />
        <city-field v-model="formdata.city" class="col-9" />
      </div>
      <div class="row">
        <phone-field v-model="formdata.phone" class="col-12" />
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
import NameField from './fields/NameField.vue';
import PlzField from "./fields/PlzField.vue";
import CityField from "./fields/CityField.vue";
import StreetField from "./fields/StreetField.vue";
import PhoneField from "./fields/PhoneField.vue";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
    NameField,
    PlzField,
    CityField,
    StreetField,
    PhoneField,
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
