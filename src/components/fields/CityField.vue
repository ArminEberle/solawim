<template>
  <validation-provider
    name="city"
    :rules="{ required: true, min: 3, max: 100 }"
    v-slot="validationContext"
  >
    <b-form-group label="Ort/Stadt/Gemeinde" label-for="city">
      <b-form-input
        name="city"
        v-model="value"
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
import { Prop } from "vue-property-decorator";
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class CityField extends Vue {
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
