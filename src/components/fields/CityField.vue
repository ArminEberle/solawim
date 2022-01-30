<template>
  <validation-provider
    name="city"
    :rules="{ required: true, min: 3, max: 100 }"
    v-slot="validationContext"
  >
    <b-form-group label="Ort/Stadt/Gemeinde" label-for="city">
      <b-form-input
        name="city"
        v-model="fieldValue"
        :input="handleInput()"
        type="text"
        autocomplete="address-level2"
        maxlength="100"
        @input="handleInput"
        :state="getValidationState(validationContext)"
        aria-describedby="city-feedback"
      />
      <b-form-invalid-feedback id="city-feedback">{{
        validationContext.errors[0]
      }}</b-form-invalid-feedback>
    </b-form-group>
  </validation-provider>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  components: {
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
