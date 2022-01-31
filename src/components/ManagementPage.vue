<template>
  <div class="solawim container">
    <h3 class="ml-0">Eingetragene Mitgliedschaften</h3>
    <template v-for="member of membersData">
      <div :key="member.id">
        <div class="row">
          <div class="col-1 twl"><label>ID</label>{{member.id}}</div>
          <div class="col-3 twl"><label>Username</label>{{member.user_nicename}}</div>
          <div class="col-6 twl"><label>Email</label><a :href="'mailto:'+member.user_email">{{member.user_email}}</a></div>
        </div>
        <div class="row" v-if="member.membership">
          <div class="col-1 twl" v-if="member.membership.applied" >
            <label>Macht mit</label>
            <i class="fas fa-check"></i>
          </div>
          <div v-else class="col-1 bg-warning">
            <label>Macht mit</label>
            Nein?
          </div>
          <div class="col-1 twl"><label>Fleisch</label>{{member.membership.orders.meat.count}}</div>
          <div class="col-2 twl"><label>Faktor Fleisch</label>{{getFactorName(member.membership.orders.meat)}}</div>
          <div class="col-2 twl"><label>Betrag Fleisch</label>{{getOrderSum(member.membership.orders.meat, 'meat')}}</div>
          <div class="col-1 twl"><label>Brot</label>{{member.membership.orders.bread.count}}</div>
          <div class="col-2 twl"><label>Faktor Brot</label>{{getFactorName(member.membership.orders.bread)}}</div>
          <div class="col-2 twl"><label>Betrag Brot</label>{{getOrderSum(member.membership.orders.bread, 'bread')}}</div>
          <div class="col-1 twl"><label>Summe</label>{{getOrderSum(member.membership.orders.meat, 'meat') + getOrderSum(member.membership.orders.bread, 'bread')}}</div>
        </div>
        <div class="row" v-else>
          <div class="col bg-yellow">
            Keine Vereinsanmeldung ausgefüllt.
          </div>
        </div>
        <div class="row" v-if="member.person">
          <div class="col-3">
            {{JSON.stringify(member.person)}}
          </div>
        </div>
        <div class="row" v-else>
          <div class="col bg-yellow">
            Keine Personalien ausgefüllt.
          </div>
        </div>
        <div class="row" v-if="member.sepa">
          <div class="col-3">
            {{JSON.stringify(member.sepa)}}
          </div>
        </div>
        <div class="row" v-else>
          <div class="col bg-warning">
            Kein SEPA-Formular ausgefüllt.
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getAllMemberData, getStatic } from "../api";
import { AllMembersData } from "../structs/AllMembersData";
import { OrderType } from "../structs/MembershipData";
import { showToast } from "../utils/showToast";
import { getFactorName, getOrderPrice } from '../utils/orderPriceCalculation';
import { Pos, StaticData } from "../structs/StaticData";


@Component({
  components: {
  },
})
export default class ManagementPage extends Vue {
  membersData: AllMembersData = [];

  staticdata: StaticData = {
    userName: "",
    app: {
      products: {
        meat: {
          price: 0,
          target: 0,
        },
        bread: {
          price: 0,
          target: 0,
        },
      },
      pos: {},
    },
  };


  created(): void {
    getStatic()
      .then((staticData) => {
        this.staticdata = staticData;
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
      })
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );

  }

  getFactorName(order: OrderType) {
    return getFactorName(order.factor);
  }

  getOrderSum(order: OrderType, kind: keyof StaticData['app']['products']) {
    return order.count * getOrderPrice(this.staticdata.app.products[kind].price, order.factor)
  }
}
</script>
