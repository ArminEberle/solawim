import Vue from 'vue';
import { extend } from 'vee-validate';

import './style.scss';
import { electronicFormatIBAN, isValidIBAN } from 'ibantools';
import { ValidationRuleSchema } from 'vee-validate/dist/types/types';
import { isLoggedIn } from './api';

import {
    BForm,
    BFormInvalidFeedback,
    BFormValidFeedback,
} from 'bootstrap-vue/esm/components/form';
import {
    BFormGroup,
} from 'bootstrap-vue/esm/components/form-group';
import {
    BFormInput,
} from 'bootstrap-vue/esm/components/form-input';
import {
    BButton,
} from 'bootstrap-vue/esm/components/button';
import { BFormCheckbox } from 'bootstrap-vue/esm/components/form-checkbox';
import { BFormSelect } from 'bootstrap-vue/esm/components/form-select';
import { BAlert } from 'bootstrap-vue/esm/components/alert';
import { ValidationProvider, ValidationObserver } from 'vee-validate';

Vue.component('BForm', BForm);
Vue.component('BFormInvalidFeedback', BFormInvalidFeedback);
Vue.component('BFormValidFeedback', BFormValidFeedback);
Vue.component('BFormGroup', BFormGroup);
Vue.component('BFormInput', BFormInput);
Vue.component('BButton', BButton);
Vue.component('BFormCheckbox', BFormCheckbox);
Vue.component('BFormSelect', BFormSelect);
Vue.component('BAlert', BAlert);
Vue.component('ValidationProvider', ValidationProvider);
Vue.component('ValidationObserver', ValidationObserver);


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

async function main() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        if (document.querySelector('#solawim_membership')) {
            import('./components/RegisterForm.vue').then(form => {
                new Vue({
                    el: '#solawim_membership',
                    render: (h) => h(form.default),
                });
            });
        }
        return;
    }

    if (document.querySelector('#solawim_membership')) {
        import('./components/MainForm.vue').then(form => {
            new Vue({
                el: '#solawim_membership',
                render: (h) => h(form.default),
            });
        });
    }
}

main();