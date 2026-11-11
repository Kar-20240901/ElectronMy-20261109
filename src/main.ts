import {createApp} from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import 'dayjs/locale/zh-cn'
import {createPinia} from 'pinia'
import {createI18n} from 'vue-i18n'

const pinia = createPinia()
const i18n = createI18n({})

const app = createApp(App)

app.use(pinia)
app.use(i18n)
app.use(ElementPlus)

app.mount('#app')
