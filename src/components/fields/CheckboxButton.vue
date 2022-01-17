<template>
  <button class="btn">
    <template v-if="value" >
      <font-awesome-icon icon="check" />
      {{truelabel}}
    </template>
    <template v-else>
      <font-awesome-icon icon="exclamation" />
      <font-awesome-icon icon="arrow-down" />
      {{falselabel}}
    </template>
  </button>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCheck, faExclamation, faArrowDown } from '@fortawesome/free-solid-svg-icons';

library.add(faCheck, faArrowDown, faExclamation);

@Component({
  components: {
    FontAwesomeIcon
  },
  props: ["value", "truelabel", "falselabel"],
})
export default class Field extends Vue {
}
</script>

