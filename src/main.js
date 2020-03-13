import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element'

import TreeTable from 'vue-table-with-tree-grid'

// 注册一个全局可用组件
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
