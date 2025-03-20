import { defineConfig, Plugin } from "vite";
import mkcert from "vite-plugin-mkcert";
import react from "@vitejs/plugin-react";

const fullReloadAlways: Plugin = {
  name: "full-reload",
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" });
    return [];
  },
};
// https://vite.dev/config/
export default defineConfig({
  server: { https: true }, // Not needed for Vite 5+
  plugins: [react(), mkcert(), fullReloadAlways],
  base: "./",
});
