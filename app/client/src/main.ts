import Vue from 'vue';
import App from './App.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faRoute,
  faExchangeAlt,
  faCheckDouble,
  faMagic,
  faCircleNotch,
  faCheck,
  faPlug,
} from '@fortawesome/free-solid-svg-icons';

library.add(faRoute);
library.add(faExchangeAlt);
library.add(faCheckDouble);
library.add(faMagic);
library.add(faCircleNotch);
library.add(faCheck);
library.add(faPlug);
Vue.component('font-awesome-icon', FontAwesomeIcon);

import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';

function createSocket() {
  if (process.env.NODE_ENV === 'production') {
    return io();
  }

  return io('http://localhost:3000');
}

Vue.use(VueSocketIOExt, createSocket());

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');