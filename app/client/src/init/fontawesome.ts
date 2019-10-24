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
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';


library.add(faRoute);
library.add(faExchangeAlt);
library.add(faCheckDouble);
library.add(faMagic);
library.add(faCircleNotch);
library.add(faCheck);
library.add(faPlug);
library.add(faInfoCircle);

export default {
  install(vue: Vue.VueConstructor) {
    vue.component('font-awesome-icon', FontAwesomeIcon);
  },
};
