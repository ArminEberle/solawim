<template>
  <section class="solawim container px-0 mx-0">
    <h3 class="mx-0">
      Hallo, schön dass Du in der Kollektiv Solawi Mitglied werden möchtest!
    </h3><p>
      Mit deinem Beitreten wirst du Teil von unseren Verein.
      Dein Mitgliedsbeitrag entspricht deinem Anteil an produzierten Gütern.
    </p><p>
      Wir haben uns für ein gestaffeltes Solidarprinzip entschieden.
      Der normale Richtwert entspricht dem errechneten Wert,
      den es im Durchschnitt braucht um die gesamten Kosten, von Pacht,
      Löhnen, Nebenkosten und Maschinen, für alle produzierten Lebensmittel zu decken.
    </p><p>
      Wenn du dich für den erhöhten Solibeitrag entscheidest,
      ermöglichst du es einem anderen Menschen einen ermäßigten Anteil zu bekommen.
      Für diesen ermäßigten Beitrag gibt es keine Kriterien.
    </p><p>
      Allerdings wünschen wir uns das besonders einkommensstarke Mitglieder
      Menschen mit strukturschwachen Hintergrund unterstützen und ihnen damit
      den Zugang zu gesunden, regionale Biolebensmittel ermöglichen.
    </p>

    <b-form class="pl-3" @submit.stop.prevent="onSubmit()" @reset.stop.prevent="onReset">
      <div class="row">
        <b-form-checkbox v-model="formdata.applied">
          &nbsp;<b>Ja ich möchte dabei sein.</b>
        </b-form-checkbox>
      </div>
      <div class="row ml-0">
        <p>
          Zur Auswahl stehen dir dieses Jahr 2 verschiedene Anteilsoptionen.
        </p><p>
          Der Umfang pro Anteil ist für den wöchentlichen Konsum von ein bis zwei ausgewachsenen Menschen errechnet.
          Wenn ihr mehr seid, wählt einfach zusätzliche Anteile aus.
        </p><p>
          Diese werden dann wöchentlich (bis auf Fleisch) in den von euch gewählten Abholraum geliefert.
        </p><p>
          Bitte beachtet die jeweils ausgehängten Informationen zu Haltbarkeit und Verarbeitung.
        </p><p>
          Eure Fleischanteile könnt ihr euch direkt nach jedem der  4 – 5 Schlachttage im Jahr beim Hof abholen.
          So vermeiden wir großräumige, energieaufwendige Kühllagerzeiten.
        </p>
        <p class="my-2">
          <b>Folgende Anteile möchte ich buchen:</b>
        </p>
      </div>
      <div class="row">
        <div class="col-2">
          <b-form-select
            v-model="formdata.orders.bread.count"
            :options="orderCountOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
        </div>
        <div class="col text-left">
          Anteil(e) Brot zum
          <b-form-select
            v-model="formdata.orders.bread.factor"
            :options="factorOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
          Beitrag <b>({{ breadPrice }} EUR / Anteil</b>)
        </div>
      </div>
      <div class="row">
        <div class="col-2">
          <b-form-select
            v-model="formdata.orders.meat.count"
            :options="orderCountOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
        </div>
        <div class="col">
          Anteil(e) Milchprodukte / Fleisch zum
          <b-form-select
            v-model="formdata.orders.meat.factor"
            :options="factorOptions"
            :disabled="!formdata.applied"
          ></b-form-select>
          Beitrag <b>({{ meatPrice }} EUR / Anteil</b>)
        </div>
      </div>
      <div class="row">
        <div class="col">
          <b-alert show variant="primary"
            >In Summe werde ich dann ab April 2022 bis einschließlich März 2023
            <b>zum Anfang jeden Monats {{ sum }},- EUR</b> bezahlen.
          </b-alert>
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
      <h3 class="mx-0 ml-n3">Bezahlung und Kündigung</h3>
      <div class="row">
      <p >
        Mit dem Speichern erklärst Du dich vertraglich gebunden.
      </p><p>
        Mit dem Abschluss Deines Mitgliedsantrages unterzeichnet Du auch ein SEPA-Lastschriftmandat,
        worüber der von dir gewählte Beitrag monatlich abgebucht werden kann (Am Anfang jeden Monats).
      </p><p>
        Prinzipiell wirst Du für ein Jahr Mitglied.
        Damit ermöglicht Du uns eine langfristige Planungssicherheit.
      </p><p>
        Du kannst diese Einstellung bis einschließlich 28.02.2022 widerrufen,
        indem Du das hier auf dieser Seite wieder zurückstellst
        oder schriftlich an den Verein (siehe 'Kontakt') mitteilst.
      </p><p>
        Zu einem späteren Zeitpunkt sind auch individuelle Lösungen nach Absprachen möglich,
        sollte sich bei euch etwas grundlegend verändern.
      </p>
      </div>
      <div class="row">
        <b-button type="submit" variant="primary">Speichern</b-button>
        <b-button type="reset" variant="secondary" class="ml-1">Zurücksetzen</b-button>
      </div>
    </b-form>
  </section>
</template>
l
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { getMembership, getStatic, setMembership } from "../api";
import { MembershipData } from "../structs/MembershipData";
import { Pos, StaticData } from "../structs/StaticData";
import { showToast } from "../utils/showToast";
import { getOrderPrice } from '../utils/orderPriceCalculation';

@Component({
  components: {
  }
})
export default class MembershipComponent extends Vue {
  factorOptions = [
    { value: -1, text: "reduzierten" },
    { value: 0, text: "normalen" },
    { value: 1, text: "solidarischen" },
  ];

  orderCountOptions = [
    {value: 0, text: "keine"},
    {value: 1, text: "1"},
    {value: 2, text: "2"},
    {value: 3, text: "3"},
    {value: 4, text: "4"},
    {value: 5, text: "5"},
    {value: 6, text: "6"},
    {value: 7, text: "7"},
    {value: 8, text: "8"},
    {value: 9, text: "9"},
    {value: 10, text: "10"},
  ]

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
    return getOrderPrice(this.staticdata.app.products.bread.price, this.formdata.orders.bread.factor);
  }

  get meatPrice() {
    return getOrderPrice(this.staticdata.app.products.meat.price, this.formdata.orders.meat.factor);
  }

  get sum(): number {
    return !this.formdata.applied
      ? 0
      : this.formdata.orders.meat.count * this.meatPrice +
          this.formdata.orders.bread.count * this.breadPrice;
  }

  breadCountChange(value: number): void {
    value = Math.floor(value);
    if(value < 0) {
      value = 0;
    }
    if(value > 10) {
      value = 10;
    }
    this.formdata.orders.bread.count = value;
  }

  onSubmit(): void {
    setMembership(this.formdata)
      .then((result) => showToast("Die Daten wurden gespeichert."))
      .catch((e) =>
        showToast("Es gab ein Problem beim Speichern der Daten am Server " + e)
      );
  }

  onReset(): boolean {
    if(!confirm('Wirklich zurücksetzen?')){
      return false;
    };
    setMembership(null)
      .then(() => {
        this.loadFormdataFromBackend();
        showToast('Die Daten wurden gelöscht');
      }).catch(e => showToast('Es gab ein Problem beim Löschen der Daten vom Server: '+e));
    return true;
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
      this.loadFormdataFromBackend();
  }

  private loadFormdataFromBackend() {
    getMembership()
      .then((membershipData) => this.loadFormData(membershipData)      )
      .catch((e) =>
        showToast("Es gab ein Problem beim Laden der Daten vom Server " + e)
      );
  }

  private loadFormData(membershipData: MembershipData) {
    this.formdata.applied = membershipData.applied;
        this.formdata.signed = membershipData.signed;
        this.formdata.pos = membershipData.pos;
        Object.assign(this.formdata.orders.meat, membershipData.orders.meat);
        Object.assign(this.formdata.orders.bread, membershipData.orders.bread);
  }
}
</script>
