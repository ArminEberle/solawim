<template>
  <validation-provider
    name="bank"
    :rules="{ required: true, min: 3, max: 50 }"
    v-slot="validationContext"
  >
    <b-form-group label="Name der Bank" label-for="bank">
      <b-form-input
        name="bank"
        v-model="fieldValue"
        :input="handleInput()"
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
