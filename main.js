import App from './App'


import Vue from 'vue'
import './uni.promisify.adaptor'

//引入翻书动画
import Turn from 'turn.js'
Vue.use(Turn)

import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

// 引入store
import store from '@/store';

// 引入uView提供的对vuex的简写法文件
let vuexStore = require('@/store/$u.mixin.js');
Vue.mixin(vuexStore);

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	store,
	...App
})

// // http拦截器，将此部分放在new Vue()和app.$mount()之间，才能App.vue中正常使用
import httpInterceptor from '@/common/http.interceptor.js';
Vue.use(httpInterceptor, app);
// uni.$u.http.setConfig((config) => {
//     /* config 为默认全局配置*/
//     config.baseURL = `http://127.0.0.1:8080/api`; /* 根域名 */
//     return config
// })
app.$mount()





// // #ifdef VUE3
// import { createSSRApp } from 'vue'
// export function createApp() {
//   const app = createSSRApp(App)
//   return {
//     app
//   }
// }
// // #endif