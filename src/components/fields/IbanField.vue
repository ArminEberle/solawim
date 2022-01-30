<template>
  <validation-provider
    name="iban"
    :rules="{ required: true, min: 22, max: 40, iban: true }"
    v-slot="validationContext"
  >
    <b-form-group label="IBAN" label-for="iban">
      <b-form-input
        name="iban"
        v-model="fieldValue"
        :input="handleInput()"
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
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  props: ["value"],
})
export default class Field extends Vue {
  private my: string | null = null;

  get fieldValue() {
    return this.my ?? this.$props.value;
  }

  set fieldValue(val) {
    this.my = val;
  }

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

  handleInput() {
    this.$emit("input", this.fieldValue);
  }
}
</script>
