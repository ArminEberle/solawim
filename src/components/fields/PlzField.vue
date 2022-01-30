<template>
  <validation-provider
    name="zip"
    :rules="{ required: true, min: 5, max: 5, numeric: true }"
    v-slot="validationContext"
  >
    <b-form-group label="PLZ" label-for="zip">
      <b-form-input
        name="zip"
        v-model="fieldValue"
        :input="handleInput()"
        type="text"
        autocomplete="postal-code"
        maxlength="5"
        :state="getValidationState(validationContext)"
        @input="handleInput"
        aria-describedby="zip-feedback"
      />
      <b-form-invalid-feedback id="zip-feedback">{{
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
