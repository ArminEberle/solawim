<template>
  <validation-provider
    name="street"
    :rules="{ required: true, min: 3, max: 150 }"
    v-slot="validationContext"
  >
    <b-form-group label="Straße und Hausnummer" label-for="street">
      <b-form-input
        name="street"
        v-model="fieldValue"
        :input="handleInput()"
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
