<template>
  <validation-provider
    name="zip"
    :rules="{ required: true, min: 5, max: 5, numeric: true }"
    v-slot="validationContext"
  >
    <b-form-group label="PLZ" label-for="zip">
      <b-form-input
        name="zip"
        v-model="value"
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
import { Prop } from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from "vee-validate";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver,
  },
})
export default class PlzField extends Vue {

  @Prop() value: string|null = null;

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

  handleInput () {
      this.$emit('input', this.value)
  }
}
</script>
