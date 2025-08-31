import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import {zhCn} from "element-plus/es/locale/index";

import Toast, {PluginOptions} from "vue-toastification";
import "vue-toastification/dist/index.css";
import pinia from "@/store/index.js";
import {useActivityStore} from "@/store/activity.js";

import "@/assets/css/style.scss"
import "@/assets/css/define.scss"
import "@/assets/css/media.scss"
import {useUserStore} from "@/store/user.js";

const app = createApp(App)

const options: PluginOptions = {};

// @ts-ignore
app.use(Toast, options);

app.use(ElementPlus, {
    locale: zhCn
})

app.use(pinia)

app.use(router)

const userStore = useUserStore();
userStore.initUser().finally(() => {
    app.mount('#app')
})
