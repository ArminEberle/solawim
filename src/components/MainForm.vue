<template>
  <div>
    <status-form />
    <membership-form class="mb-5" />
    <personal-details-form class="mb-5" />
    <sepa-form />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import MembershipForm from './MembershipForm.vue';
import PersonalDetailsForm from './PersonalDetailsForm.vue';
import SepaForm from './SepaForm.vue';
import StatusForm from './StatusForm.vue';

@Component(
  {
  components: {
    MembershipForm,
    PersonalDetailsForm,
    SepaForm,
    StatusForm
  },
})
export default class Main extends Vue {

}
</script>
