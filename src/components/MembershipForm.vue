<template>
  <div class="container">
    <h1>Mitgliedschaft ankündigen</h1>
    <b-form @submit.stop.prevent="onSubmit()">
      <div class="row">
        <b-form-checkbox v-model="formdata.applied">
          &nbsp;Ja ich möchte dabei sein. Folgende Anteile möchte ich buchen:
        </b-form-checkbox>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="10"
            v-model="formdata.orders.bread.count"
            :disabled="!formdata.applied"
          />
        </div>
        <div class="col">
          Anteile Brot zum
          <b-form-select
            v-model="formdata.orders.bread.factor"
            :options="factorOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
          Beitrag ({{ breadPrice }} EUR / Anteil)
        </div>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="10"
            v-model="formdata.orders.meat.count"
            :disabled="!formdata.applied"
          />
        </div>
        <div class="col">
          Anteile Milchprodukte / Fleisch zum
          <b-form-select
            v-model="formdata.orders.meat.factor"
            :options="factorOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
          Beitrag ({{ meatPrice }} EUR / Anteil)
        </div>
      </div>
      <div class="row">
        <div class="col">
          <b-alert show variant="primary"
            >In Summe werde ich dann
            <b>monatlich {{ sum }},- EUR</b> bezahlen.</b-alert
          >
        </div>
      </div>
      <div class="row">
        <div class="col">
          Abholen möchte ich die Anteile dann wöchentlich im Abholraum:
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <b-form-select
            v-model="formdata.pos"
            :options="posOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
        </div>
      </div>
      <b-button type="submit" variant="primary">Speichern</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getMembership, getStatic, setMembership } from "../api";
import { MembershipData } from "../structs/MembershipData";
import { Pos, StaticData } from "../structs/StaticData";
import { showToast } from "../utils/showToast";

@Component({})
export default class MembershipComponent extends Vue {
  factorOptions = [
    { value: -1, text: "reduzierten" },
    { value: 0, text: "normalen" },
    { value: 1, text: "solidarischen" },
  ];

  posOptions: { value: string; text: string }[] = [];

  formdata: MembershipData = {
    applied: false,
    signed: false,
    pos: "",
    orders: {
      meat: {
        count: 0,
        factor: 0,
      },
      bread: {
        count: 0,
        factor: 0,
      },
    },
  };

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

  get breadPrice() {
    if (this.formdata.orders.bread.factor === 0) {
      return this.staticdata.app.products.bread.price;
    }
    if (this.formdata.orders.bread.factor < 0) {
      return (
        this.staticdata.app.products.bread.price -
        Math.floor(this.staticdata.app.products.bread.price * 0.25)
      );
    }
    return (
      this.staticdata.app.products.bread.price +
      Math.floor(this.staticdata.app.products.bread.price * 0.25)
    );
  }

  get meatPrice() {
    if (this.formdata.orders.meat.factor === 0) {
      return this.staticdata.app.products.meat.price;
    }
    if (this.formdata.orders.meat.factor < 0) {
      return (
        this.staticdata.app.products.meat.price -
        Math.floor(this.staticdata.app.products.meat.price * 0.25)
      );
    }
    return (
      this.staticdata.app.products.meat.price +
      Math.floor(this.staticdata.app.products.meat.price * 0.25)
    );
  }

  get sum(): number {
    return !this.formdata.applied
      ? 0
      : this.formdata.orders.meat.count * this.meatPrice +
          this.formdata.orders.bread.count * this.breadPrice;
  }

  onSubmit(): void {
    setMembership(this.formdata)
      .then((result) => showToast("Die Daten wurden gespeichert."))
      .catch((e) =>
        showToast("Es gab ein Problem beim Speichern der Daten am Server " + e)
      );
  }

  created(): void {
    getStatic()
      .then((staticData) => {
        this.staticdata = staticData;
        this.posOptions = Object.entries(staticData.app.pos).map(
          ([name, pos]) => {
            return {
              value: name,
              text: pos.name + ", " + pos.address,
            };
          }
        );
      })
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );
    getMembership()
      .then((membershipData) => {
        this.formdata.applied = membershipData.applied;
        this.formdata.signed = membershipData.signed;
        this.formdata.pos = membershipData.pos;
        Object.assign(this.formdata.orders.meat, membershipData.orders.meat);
        Object.assign(this.formdata.orders.bread, membershipData.orders.bread);
      })
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );
  }
}
</script>

<style lang="scss">
</style>
