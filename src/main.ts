import Vue from 'vue';
import { BootstrapVue } from 'bootstrap-vue';
// import { IconsPlugin } from 'bootstrap-vue'
import { extend } from 'vee-validate';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './style.scss';

import { electronicFormatIBAN, isValidIBAN } from 'ibantools';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);

import {
    required,
    min,
    max,
    alpha,
    alpha_num,
    numeric,
} from 'vee-validate/dist/rules';
extend('required', {
    ...required,
    message: 'Hier fehlt ein Wert',
});
extend('min', {
    ...min,
    message: 'Das ist zu kurz',
});
extend('max', {
    ...max,
    message: 'Das ist zu lang',
});
extend('alpha', {
    ...alpha,
    message: 'Hier sind nur Buchstaben erlaubt',
});
extend('alpha_num', {
    ...alpha_num,
    message: 'Hier sind nur Buchstaben und Ziffern erlaubt',
});
extend('numeric', {
    ...numeric,
    message: 'Hier sind nur Ziffern erlaubt',
});

// DE95 7601 0085 0916 7418 58
// DE95760100850916741858

extend('iban', {
    message: 'Das scheint keine gültige IBAN zu sein',
    validate: function(value: string, params: any): any {
        const self = this as ValidationRuleSchema;
        const msg
      = self?.message?.toString() ?? 'Das scheint keine gültige IBAN zu sein';
        if (value === null) {
            return msg;
        }
        const iban = electronicFormatIBAN(value);
        if (iban === null) {
            return msg;
        }
        if (!isValidIBAN(iban)) {
            return msg;
        }
        return true;
    },
});

import { ValidationRuleSchema } from 'vee-validate/dist/types/types';

// if (document.querySelector('#solawim-membership')) {
//     import('./components/MembershipForm.vue').then(form => {
//         new Vue({
//             el: '#solawim-membership',
//             render: (h) => h(form.default),
//         });
//     });
// }

if (document.querySelector('#solawim-personal')) {
    import('./components/PersonalDetailsForm.vue').then(form => {
        new Vue({
            el: '#solawim-personal',
            render: (h) => h(form.default),
        });
    });
}

// if (document.querySelector('#solawim-sepa')) {
//     import('./components/SepaForm.vue').then(form => {
//         new Vue({
//             el: '#solawim-sepa',
//             components: {
//                 ValidationProvider,
//             },
//             render: (h) => h(form.default),
//         });
//     });
// }