import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import {zhCn} from "element-plus/es/locale/index";

import Toast, {PluginOptions} from "vue-toastification";
import "vue-toastification/dist/index.css";
import 'element-plus/theme-chalk/dark/css-vars.css'
import pinia from "@/store/index.js";

import "@/assets/css/style.scss"
import "@/assets/css/dark.scss"
import "@/assets/css/define.scss"
import "@/assets/css/media.scss"
import {useUserStore} from "@/store/user.js";
import {useServerConfigStore} from "@/store/server_config.js";

const app = createApp(App);

const options: PluginOptions = {};

// @ts-ignore
app.use(Toast, options);
app.use(ElementPlus, {locale: zhCn});
app.use(pinia);
app.use(router);

useServerConfigStore().getConfigFromServer().catch();
const userStore = useUserStore();
userStore.initUser().finally(() => app.mount('#app'));
