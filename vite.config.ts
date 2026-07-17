import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import styleImport, { VantResolve } from 'vite-plugin-style-import';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), styleImport({
        resolves: [VantResolve()],
    }),],    
    // 将 server 配置放在这里
    server: {
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:8101',
                changeOrigin: true,
            }
        }
    }

})
