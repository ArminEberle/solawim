<template>
  <validation-provider
    name="phone"
    :rules="{ required: true, min: 8, max: 40 }"
    v-slot="validationContext"
  >
    <b-form-group label="Telefon" label-for="phone">
      <b-form-input
        name="phone"
        v-model="fieldValue"
        :input="handleInput()"
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
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
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
