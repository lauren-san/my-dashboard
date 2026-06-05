import './assets/main.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
	components,
	directives,
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
	theme: {
		defaultTheme: 'dark',
		themes: {
			light: {
				dark: false,
				colors: {
					primary: '#0ea87e',
					secondary: '#0e8c7a',
					background: '#f2fdf9',
					surface: '#ffffff',
					success: '#0f9f77',
					warning: '#c88a1d',
					error: '#c73a50',
				},
			},
			dark: {
				dark: true,
				colors: {
					primary: '#6f86ff',
					secondary: '#8c5bff',
					background: '#0a1024',
					surface: '#171f3f',
					success: '#48c994',
					warning: '#d6a13c',
					error: '#f06a82',
				},
			},
		},
	},
})

const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
