<template>
  <div class="container">
    <h1>Mitgliedschaft ankündigen</h1>
    <b-form>
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
        <div class="col">Anteile Brot ({{ staticdata.app.products.bread.price }} EUR / Anteil)</div>
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
          Anteile Milchprodukte / Fleisch ({{ staticdata.app.products.meat.price }} EUR / Anteil)
        </div>
      </div>
      <div class="row">
        <div class="col">
          Zusätzlich möchte ich folgende Beträge monatlich als Solidarbeitrag
          für andere Mitglieder bereitstellen. Unter den Mitgliedern, die
          solidarische Hilfe erbitten, wird dieser dann aufgeteilt, je nach
          Anteilsart.
        </div>
      </div>
      <!-- <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="200"
            v-model="solidarBread"
            :disabled="!formdata.applied"
          />
        </div>
        <div class="col">EUR für Brot</div>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="200"
            v-model="solidarMeat"
            :disabled="!formdata.applied"
          />
        </div>
        <div class="col">EUR für Milchprodukte / Fleisch</div>
      </div> -->
      <div class="row">
        <div class="col">
          <b-alert show variant="primary"
            >In Summe werde ich dann
            <b>monatlich {{ sum }},- EUR</b> bezahlen.</b-alert
          >
        </div>
      </div>
      <b-button v-on:click="save" variant="primary">Speichern</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getMembership, getStatic } from "../api";
import { MembershipData } from "../structs/MembershipData";
import { StaticData } from "../structs/StaticData";
import { showToast } from "../utils/showToast";
import { toInt } from "../utils/toInt";

@Component({})
export default class MembershipComponent extends Vue {
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

  priceBread = 30;
  priceMeat = 100;

  save(): void {
    console.log(this.formdata);
  }

  created(): void {
    getStatic()
      .then((staticData) => (this.staticdata = staticData))
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

  get sum(): number {
    return !this.formdata.applied
      ? 0
      : this.formdata.orders.meat.count *
          this.staticdata.app.products.meat.price +
          this.formdata.orders.bread.count *
            this.staticdata.app.products.bread.price;
  }
}
</script>

<style lang="scss">
</style>
