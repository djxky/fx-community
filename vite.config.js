import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 产物 = 单个自包含 index.html(vite-plugin-singlefile 内联 JS/CSS/图片)
// 可直接 file:// 打开、挂 GitHub Pages、或作为 Artifact 分享。
export default defineConfig({
  base: './',
  plugins: [vue(), viteSingleFile()],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000,
  },
})
