import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { fileURLToPath } from "node:url";

const pathSrc = fileURLToPath(new URL("./src", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": pathSrc,
    },
  },
  build: {
    outDir: "fe-web-dist", // 自定义输出目录
  },
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ["vue"],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: "Icon", // 用法：<i-ep-plus/>，iconify用法：
        }),
      ],
      dts: fileURLToPath(new URL("./src/auto-imports.d.ts", import.meta.url)),
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ["ep"],
        }),
        ElementPlusResolver(),
      ],
      dts: fileURLToPath(new URL("./src/components.d.ts", import.meta.url)),
    }),
    Icons({
      autoInstall: true,
      compiler: "vue3",
    }),
    vueDevTools(),
  ],
});
