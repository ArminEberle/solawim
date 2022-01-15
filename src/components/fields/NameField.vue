<template>
  <validation-provider
    name="name"
    :rules="{ required: true, min: 3, max: 150 }"
    v-slot="validationContext"
  >
    <b-form-group :label="label" label-for="name">
      <b-form-input
        name="name"
        v-model="fieldValue"
        :input="handleInput()"
        type="text"
        :autocomplete="autocomplete"
        maxlength="150"
        :state="getValidationState(validationContext)"
        aria-describedby="name-feedback"
      />
      <b-form-invalid-feedback id="name-feedback">{{
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
  props: ["value", "label", "autocomplete"],
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

