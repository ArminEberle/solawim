import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue'
// import { IconsPlugin } from 'bootstrap-vue'
import { ValidationProvider, extend } from 'vee-validate';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './style.scss';

import {electronicFormatIBAN, isValidIBAN} from 'ibantools';
// const ibantools = require('ibantools');
// const iban = ibantools.electronicFormatIBAN('NL91 ABNA 0517 1643 00'); // 'NL91ABNA0517164300'
// ibantools.isValidIBAN(iban);


// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin);


import { required, min, max } from 'vee-validate/dist/rules';
extend('required', {
  ...required,
  message: 'Hier fehlt ein Wert'
});
extend('min', {
  ...min,
  message: 'Das ist zu kurz'
});
extend('max', {
  ...max,
  message: 'Das ist zu lang'
});

// DE95 7601 0085 0916 7418 58

extend('iban', {
  message: 'Das scheint keine gültige IBAN zu sein',
  validate: function(value: string, params: any): any {
    const self = (this as ValidationRuleSchema);
    const msg = self?.message?.toString() ?? 'Das scheint keine gültige IBAN zu sein';
    if(value === null) {
      return msg;
    }
    const iban = electronicFormatIBAN(value);
    if(iban === null) {
      return msg;
    }
    if(!isValidIBAN(iban)) {
      return msg;
    }
    return true;
  }
});

import MembershipForm from './components/MembershipForm.vue';
import PersonalDetailsForm from './components/PersonalDetailsForm.vue';
import SepaForm from './components/SepaForm.vue';
import { ValidationResult, ValidationRuleSchema } from 'vee-validate/dist/types/types';

new Vue({
    el: '#membership',
    render: h => h(MembershipForm),
});

new Vue({
    el: '#personal',
    render: h => h(PersonalDetailsForm),
});

new Vue({
    el: '#sepa',
    components: {
      ValidationProvider
    },
    render: h => h(SepaForm),
});

