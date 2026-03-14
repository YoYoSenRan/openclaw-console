import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");

export default defineConfig(({ mode }) => {
  // 从 monorepo 根目录加载 .env，前缀为空表示读取所有变量
  const env = loadEnv(mode, rootDir, "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // 让 import.meta.env.VITE_* 能读到根目录 .env 中的变量
    envDir: rootDir,
    server: {
      port: 5300,
      proxy: {
        [env.VITE_API_PREFIX ?? "/api"]: {
          target: `http://localhost:${env.SERVER_PORT ?? 3200}`,
          changeOrigin: true,
        },
      },
    },
  };
});
