<template>
  <div>
    <checkbox-button
      :value="membershipSigned"
      truelabel="This is true"
      falselabel="This is false"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getMembership, getStatic, setMembership } from "../api";
import Component from "vue-class-component";
import CheckboxButton from "./fields/CheckboxButton.vue";
import { showToast } from "../utils/showToast";

@Component({
  components: {
    CheckboxButton,
  },
})
export default class StatusForm extends Vue {
  membershipSigned = false;

  created() {
    getMembership()
      .then((membershipData) => {
        this.membershipSigned = membershipData.applied;
      })
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );
  }
}
</script>
