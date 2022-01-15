<template>
  <validation-provider
    name="bic"
    :rules="{ required: true, min: 3, max: 50, alpha_num: true }"
    v-slot="validationContext"
  >
    <b-form-group label="BIC" label-for="bic">
      <b-form-input
        name="bic"
        v-model="value"
        @input="handleInput"
        type="text"
        autocomplete="payee-bank-code"
        maxlength="100"
        :state="getValidationState(validationContext)"
        aria-describedby="bic-feedback"
      />
      <b-form-invalid-feedback id="bic-feedback">{{
        validationContext.errors[0]
      }}</b-form-invalid-feedback>
    </b-form-group>
  </validation-provider>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class BicField extends Vue {
  @Prop() value: string | null = null;

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

  getData() {
    return this.value;
  }

  handleInput() {
    this.$emit("input", this.value);
  }
}
</script>
