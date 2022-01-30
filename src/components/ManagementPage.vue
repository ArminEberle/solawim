<template>
  <div class="solawim container">
    <h3 class="ml-0">Eingetragene Mitgliedschaften</h3>
    <div class="row">
      <div class="col-1">ID</div>
      <div class="col-1">Anmeldename</div>
      <div class="col-1">Email</div>
      <div class="col-3">Mitgliedschaft</div>
      <div class="col-3">Personalien</div>
      <div class="col-3">Sepa</div>
    </div>
    <div class="row" v-for="member of membersData" :key="member.id">
      <div class="col-1">{{member.id}}</div>
      <div class="col-1">{{member.user_nicename}}</div>
      <div class="col-1"><a :href="'mailto:'+member.user_email">{{member.user_email}}</a></div>
      <div class="col-3">
        {{JSON.stringify(member.membership)}}
      </div>
      <div class="col-3">
        {{JSON.stringify(member.person)}}
      </div>
      <div class="col-3">
        {{JSON.stringify(member.sepa)}}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getAllMemberData } from "../api";
import { AllMembersData } from "../structs/AllMembersData";
import { showToast } from "../utils/showToast";

@Component({
  components: {
  },
})
export default class ManagementPage extends Vue {
  membersData: AllMembersData = [];
  created(): void {
    getAllMemberData()
      .then((data) => {
        for(const row of data) {
          this.membersData.push(row);
        }
        // this.membersData = data;
      })
      .catch((e) => {
        showToast("Es gab ein Problem beim Laden der Daten vom Server: " + e);
      });
  }
}
</script>
