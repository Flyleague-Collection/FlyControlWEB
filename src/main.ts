import {createApp} from 'vue'
import "@/assets/css/style.css"
import App from './App.vue'
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import {zhCn} from "element-plus/es/locale/index";

const app = createApp(App)

app.use(ElementPlus, {
    locale: zhCn
})

app.use(router)

app.mount('#app')