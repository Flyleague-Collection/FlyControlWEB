import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {URL} from "node:url";
import {fileURLToPath} from 'url'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

const pathSrc = fileURLToPath(new URL('./src', import.meta.url))
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': pathSrc
        },
        extensions: [
            '.js',
            '.json',
            '.jsx',
            '.mjs',
            '.ts',
            '.tsx',
            '.vue'
        ]
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    },
    server: {
        host: '0.0.0.0',
        port: 8080,
        proxy: {
            "/api": "http://127.0.0.1"
        }
    },
    esbuild: {
        supported: {
            "top-level-await": true
        },
        drop: [
            // 'debugger'
        ]
    }
})