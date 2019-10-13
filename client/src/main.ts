import Vue from 'vue';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { faRoute, faExchangeAlt, faCheckDouble, faMagic, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

Vue.config.productionTip = false;

library.add(faRoute);
library.add(faExchangeAlt);
library.add(faCheckDouble);
library.add(faMagic);
library.add(faCircleNotch);
Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
