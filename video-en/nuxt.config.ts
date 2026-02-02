export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  app: {
    head: {
      title: '看视频学英语',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' }
      ]
    }
  },
  css: ['~/assets/scss/main.scss'],
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['./stores/**']
  }
})
