// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@vant/nuxt'
    ],
    ssr: true, //When false
    experimental:{
        payloadExtraction:false
    }
})
