<template>
  <div id="app">
    <h1>Mitgliedschaft ankündigen</h1>
    <input v-model="membership" type="checkbox" />
      Ja ich möchte dabei sein. Folgende Anteile möchte ich buchen:
    <p>
      <div>
        <input type="number" min="0" max="10" v-model="vegetables" /> Anteile Gemüse ({{priceVegetables}} EUR / Anteil)
      </div>
      <div>
        <input type="number" min="0" max="10" v-model="bread" /> Anteile Brot ({{priceBread}} EUR / Anteil)
      </div>
      <div>
        <input type="number" min="0" max="10" v-model="meat" /> Anteile Milchprodukte / Fleisch ({{priceMeat}} EUR / Anteil)
      </div>
    </p>
    <p>
      Zusätzlich möchte ich folgende Beträge monatlich als Solidarbeitrag für andere Mitglieder bereitstellen.
      Unter den Mitgliedern, die solidarische Hilfe erbitten, wird dieser dann aufgeteilt, je nach Anteilsart.
      <div>
        <input type="number" min="0" max="200" v-model="solidarVegetables" /> EUR für Gemüse
      </div>
      <div>
        <input type="number" min="0" max="200" v-model="solidarBread" /> EUR für Brot
      </div>
      <div>
        <input type="number" min="0" max="200" v-model="solidarMeat" /> EUR für Milchprodukte / Fleisch
      </div>
    </p>
    <p>
      In Summe werde ich dann monatlich {{sum}} EUR bezahlen.
    </p>
    <button v-on:click="save">Speichern</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {toInt} from './utils/toInt';

@Component({})
export default class MembershipComponent extends Vue {
  membership = false;

  priceVegetables = 40;
  priceBread = 30;
  priceMeat = 60;

  vegetables: string = '0';
  bread: string = '0';
  meat: string = '0';

  solidarVegetables: string = '0';
  solidarBread: string = '0';
  solidarMeat: string = '0';

  save(): void {
    console.log(this.membership);
  }

  get sum(): number {
    return (toInt(this.vegetables) * this.priceVegetables)
      + (toInt(this.bread) * this.priceBread)
      + (toInt(this.meat) * this.priceMeat)
      + toInt(this.solidarVegetables)
      + toInt(this.solidarBread)
      + toInt(this.solidarMeat)
  }
}
</script>

<style lang="scss">
</style>
