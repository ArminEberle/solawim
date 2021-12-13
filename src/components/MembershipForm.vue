<template>
  <div class="container">
    <h1>Mitgliedschaft ankündigen</h1>
    <b-form>
      <div class="row">
        <b-form-checkbox v-model="membership">
          &nbsp;Ja ich möchte dabei sein. Folgende Anteile möchte ich buchen:
        </b-form-checkbox>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="10"
            v-model="vegetables"
            :disabled="!membership"
          />
        </div>
        <div class="col">Anteile Gemüse ({{ priceVegetables }} EUR / Anteil)</div>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="10"
            v-model="bread"
            :disabled="!membership"
          />
        </div>
        <div class="col">Anteile Brot ({{ priceBread }} EUR / Anteil)</div>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="10"
            v-model="meat"
            :disabled="!membership"
          />
        </div>
        <div class="col">
          Anteile Milchprodukte / Fleisch ({{ priceMeat }} EUR / Anteil)
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
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="200"
            v-model="solidarVegetables"
            :disabled="!membership"
          />
        </div>
        <div class="col">EUR für Gemüse</div>
      </div>
      <div class="row">
        <div class="col-3">
          <b-form-spinbutton
            type="number"
            min="0"
            max="200"
            v-model="solidarBread"
            :disabled="!membership"
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
            :disabled="!membership"
          />
        </div>
        <div class="col">EUR für Milchprodukte / Fleisch</div>
      </div>
      <div class="row" >
        <div class="col">
          <b-alert show variant="primary">In Summe werde ich dann <b>monatlich {{ sum }},- EUR</b> bezahlen.</b-alert>
        </div>
      </div>
      <b-button v-on:click="save" variant="primary">Speichern</b-button>
    </b-form>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { toInt } from "../utils/toInt";

@Component({})
export default class MembershipComponent extends Vue {
  membership = false;

  priceVegetables = 40;
  priceBread = 30;
  priceMeat = 60;

  vegetables = 0;
  bread = 0;
  meat = 0;

  solidarVegetables = 0;
  solidarBread = 0;
  solidarMeat = 0;

  save(): void {
    console.log(this.membership);
  }

  get sum(): number {
    return !this.membership
      ? 0
      : this.vegetables * this.priceVegetables +
          this.bread * this.priceBread +
          this.meat * this.priceMeat +
          this.solidarVegetables +
          this.solidarBread +
          this.solidarMeat;
  }
}
</script>

<style lang="scss">
</style>
