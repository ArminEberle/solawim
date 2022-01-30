import Vue from 'vue';
import './style.scss';
import { isLoggedIn } from './api';

async function main() {
    const loggedIn = await isLoggedIn();
    if (!document.querySelector('#solawim_manage')) {
        return;
    }

    if (!loggedIn) {
        import('./components/RegisterForm.vue').then(form => {
            new Vue({
                el: '#solawim_manage',
                render: (h) => h(form.default),
            });
        });
        return;
    }

    import('./components/ManagementPage.vue').then(form => {
        new Vue({
            el: '#solawim_manage',
            render: (h) => h(form.default),
        });
    });
}

main();