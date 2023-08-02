import { createApp } from 'vue'
import App from './App.vue'
import Vant from 'vant';
import 'vant/lib/index.css';
import XEUtils from 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'


createApp(App).use(Vant).use(XEUtils).use(VXETable).mount('#app')
