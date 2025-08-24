import {createApp} from 'vue'
import "@/assets/css/style.css"
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import {zhCn} from "element-plus/es/locale/index";

import Toast, {PluginOptions} from "vue-toastification";
import "vue-toastification/dist/index.css";
import pinia from "@/store/index.js";
import {useActivityStore} from "@/store/activity.js";

const app = createApp(App)

const options: PluginOptions = {};

// @ts-ignore
app.use(Toast, options);

app.use(ElementPlus, {
    locale: zhCn
})

app.use(pinia)

app.use(router)

useActivityStore()

app.mount('#app')