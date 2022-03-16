<template>
  <div class="solawim">
    <h2 class="ml-0">Eingetragene Mitgliedschaften</h2>
    <div class="container border p-4" >
      <div class="row">
        <h3 class="ml-n1">Summen</h3>
      </div>
      <div class="row" >
        <div class="col-4"><label class="ml-n3">Brot</label></div>
        <div class="col-1"></div>
        <div class="col-4"><label class="ml-n3">Fleisch</label></div>
        <div class="col-1"></div>
      </div>
      <div class="row">
        <div class="col-1 twl text-right border">
          <label>reduz.</label>
          {{counts.breadLow}}
        </div>
        <div class="col-1 twl text-right border">
          <label>normal</label>
          {{counts.breadNormal}}
        </div>
        <div class="col-1 twl text-right border">
          <label>solidar</label>
          {{counts.breadHigh}}
        </div>
        <div class="col-1 twl text-right border font-weight-bold text-underline">
          <label class="font-weight-bold">Gesamt</label>
          {{counts.breadLow + counts.breadNormal + counts.breadHigh}}
        </div>
        <div class="col-1"></div>
        <div class="col-1 twl text-right border">
          <label>reduz.</label>
          {{counts.meatLow}}
        </div>
        <div class="col-1 twl text-right border">
          <label>normal</label>
          {{counts.meatNormal}}
        </div>
        <div class="col-1 twl text-right border">
          <label>solidar</label>
          {{counts.meatHigh}}
        </div>
        <div class="col-1 twl text-right border font-weight-bold text-underline">
          <label class="font-weight-bold">Gesamt</label>
          {{counts.meatLow + counts.meatNormal + counts.meatHigh}}
        </div>
      </div>

      <div class="row">
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.breadLowSum}}
        </div>
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.breadNormalSum}}
        </div>
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.breadHighSum}}
        </div>
        <div class="col-1 twl text-right border font-weight-bold text-underline">
          <label class="font-weight-bold">EUR</label>
          {{counts.breadLowSum + counts.breadNormalSum + counts.breadHighSum}}
        </div>
        <div class="col-1"></div>
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.meatLowSum}}
        </div>
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.meatNormalSum}}
        </div>
        <div class="col-1 twl text-right border">
          <label>EUR</label>
          {{counts.meatHighSum}}
        </div>
        <div class="col-1 twl text-right border font-weight-bold text-underline">
          <label class="font-weight-bold">EUR</label>
          {{counts.meatLowSum + counts.meatNormalSum + counts.meatHighSum}}
        </div>
        <div class="col-2" ></div>
        <div class="col-1 twl font-weight-bold text-underline">
          <label class="font-weight-bold">Total EUR</label>
          {{counts.total}}
        </div>
      </div>
    </div>
    <div
      v-for="member of membersData"
      :key="member.id"
      class="container border p-4"
    >
      <div class="row">
        <div class="col-1 twl"><label>ID</label>{{ member.id }}</div>
        <div class="col-3 twl">
          <label>Username</label>{{ member.user_nicename }}
        </div>
        <div class="col-6 twl">
          <label>Email</label>
          <a :href="'mailto:' + member.user_email">{{ member.user_email }}</a>
        </div>
        <div class="col-2 twl border user-select-none cursor-pointer" v-on:click="toggleMemberActive(member.id)">
          <label for="activeMembership">Aktivität</label>
          <template v-if="member.membership.activeMembership" >Aktiv</template>
          <template v-else>Passiv</template>
        </div>
      </div>
      <div class="row" v-if="member.membership">
        <div class="col-1 twl" v-if="member.membership.applied">
          <label>Macht mit</label>
          <i class="fas fa-check"></i>
        </div>
        <div v-else class="col-1 bg-warning">
          <label>Macht mit</label>
          Nein?
        </div>
        <div class="col-1 twl">
          <label>Brot</label>{{ member.membership.orders.bread.count }}
        </div>
        <div class="col-2 twl">
          <label>Faktor Brot</label
          >{{ getFactorName(member.membership.orders.bread) }}
        </div>
        <div class="col-2 twl">
          <label>Betrag Brot</label
          >{{ getOrderSum(member.membership.orders.bread, "bread") }}
        </div>
        <div class="col-1 twl">
          <label>Fleisch</label>{{ member.membership.orders.meat.count }}
        </div>
        <div class="col-2 twl">
          <label>Faktor Fleisch</label
          >{{ getFactorName(member.membership.orders.meat) }}
        </div>
        <div class="col-2 twl">
          <label>Betrag Fleisch</label
          >{{ getOrderSum(member.membership.orders.meat, "meat") }}
        </div>
        <div class="col-1 twl text-underline">
          <label>Summe</label
          >{{
            getOrderSum(member.membership.orders.meat, "meat") +
            getOrderSum(member.membership.orders.bread, "bread")
          }}
        </div>
      </div>
      <div class="row" v-else>
        <div class="col bg-yellow">Keine Vereinsanmeldung ausgefüllt.</div>
      </div>
      <div class="row" v-if="member.person">
        <div class="col-12 twl">
          <label>Personalien</label>
          {{ member.person.firstname }}
          {{ member.person.lastname }}, {{ member.person.street }},
          {{ member.person.zip }}
          {{ member.person.city }}, Tel: {{ member.person.phone }}
        </div>
      </div>
      <div class="row" v-else>
        <div class="col bg-yellow">Keine Personalien ausgefüllt.</div>
      </div>
      <div class="row" v-if="member.sepa">
        <div class="col-12 twl">
          <label>SEPA</label>
          {{ member.sepa.name }}, {{ member.sepa.street }},
          {{ member.sepa.zip }}
          {{ member.sepa.city }}, IBAN: {{ member.sepa.iban }}, BIC:
          {{ member.sepa.bic }}, Bank: {{ member.sepa.bank }}
        </div>
      </div>
      <div class="row" v-else>
        <div class="col bg-warning">Kein SEPA-Formular ausgefüllt.</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getAllMemberData, getStatic, setMembershipActive } from "../api";
import { AllMembersData } from "../structs/AllMembersData";
import { OrderType } from "../structs/MembershipData";
import { showToast } from "../utils/showToast";
import { getFactorName, getOrderPrice } from "../utils/orderPriceCalculation";
import { StaticData } from "../structs/StaticData";
import { cloneDeep } from 'lodash';

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
            for (const row of data) {
              if(!row.membership) {
                row.membership = {
                  applied: false,
                  activeMembership: false,
                  signed: false,
                  pos: '',
                  orders: {
                    bread: {
                      count: 0,
                      factor: 0,
                    },
                    meat: {
                      count: 0,
                      factor: 0,
                    }
                  }
                }
              }
              if(!row.membership.activeMembership) {
                row.membership.activeMembership = false;
              }
              this.membersData.push(row);
            }
          })
          .catch((e) => {
            showToast(
              "Es gab ein Problem beim Laden der Daten vom Server: " + e
            );
          });
      })
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );
  }

  getFactorName(order: OrderType) {
    return getFactorName(order.factor);
  }

  getOrderSum(order: OrderType, kind: keyof StaticData["app"]["products"]) {
    return (
      order.count *
      getOrderPrice(this.staticdata.app.products[kind].price, order.factor)
    );
  }

  toggleMemberActive(memberId: string) {
    for(let i = 0; i < this.membersData.length; i++) {
      const member = this.membersData[i];
      if(member.id !== memberId) {
        continue;
      }
      if(member.membership) {
        const newActiveState = !member.membership?.activeMembership;
        member.membership.activeMembership = newActiveState;
        this.$set(this.membersData, i, cloneDeep(member));
        setMembershipActive(member.id, newActiveState);
        return;
      }
    }
  }

  get counts() {
    const result = {
      breadLow: 0,
      breadNormal: 0,
      breadHigh: 0,
      meatLow: 0,
      meatNormal: 0,
      meatHigh: 0,
      breadLowSum: 0,
      breadNormalSum: 0,
      breadHighSum: 0,
      meatLowSum: 0,
      meatNormalSum: 0,
      meatHighSum: 0,
      total: 0,
    };

    for (const member of this.membersData) {
      if (!member.membership || !member.membership.applied) {
        continue;
      }
      const bread = member.membership.orders.bread;
      if (bread.count > 0) {
        let count = bread.count;
        if (bread.factor < 0) {
          result.breadLow += count;
        } else if (bread.factor === 0) {
          result.breadNormal += count;
        } else {
          result.breadHigh += count;
        }
      }
      const meat = member.membership.orders.meat;
      if (meat.count > 0) {
        let count = meat.count;
        if (meat.factor < 0) {
          result.meatLow += count;
        } else if (meat.factor === 0) {
          result.meatNormal += count;
        } else {
          result.meatHigh += count;
        }
      }
    }

    Object.assign(result, {
      breadLowSum: this.getOrderSum({count: result.breadLow, factor: -1}, 'bread'),
      breadNormalSum: this.getOrderSum({count: result.breadNormal, factor: 0}, 'bread'),
      breadHighSum: this.getOrderSum({count: result.breadHigh, factor: 1}, 'bread'),
      meatLowSum: this.getOrderSum({count: result.meatLow, factor: -1}, 'meat'),
      meatNormalSum: this.getOrderSum({count: result.meatNormal, factor: 0}, 'meat'),
      meatHighSum: this.getOrderSum({count: result.meatHigh, factor: 1}, 'meat'),
    })
    result.total = result.breadLowSum + result.breadNormalSum + result.breadHighSum
                   + result.meatLowSum + result.meatNormalSum + result.meatHighSum;
    return result;
  }
}
</script>
