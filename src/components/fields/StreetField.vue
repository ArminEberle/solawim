<template>
  <validation-provider
    name="street"
    :rules="{ required: true, min: 3, max: 150 }"
    v-slot="validationContext"
  >
    <b-form-group label="Straße und Hausnummer" label-for="street">
      <b-form-input
        name="street"
        v-model="value"
        @input="handleInput"
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
import { Prop } from "vue-property-decorator";
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class StreetField extends Vue {
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
