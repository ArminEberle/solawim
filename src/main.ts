import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import { ValidationProvider, extend } from 'vee-validate';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

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

import MembershipForm from './components/MembershipForm.vue';
import PersonalDetailsForm from './components/PersonalDetailsForm.vue';
import SepaForm from './components/SepaForm.vue';

// new Vue({
//     el: '#membership',
//     render: h => h(MembershipForm),
// });

// new Vue({
//     el: '#personal',
//     render: h => h(PersonalDetailsForm),
// });

new Vue({
    el: '#sepa',
    components: {
      ValidationProvider
    },
    render: h => h(SepaForm),
});

