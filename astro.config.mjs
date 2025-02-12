// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  output: "static",
  site: "https://omu-aikido.com",

  redirects: {
      "/signin": "https://app.omu-aikido.com/sign-in",
  },

  vite: {
      build: {
          rollupOptions: {
              external: ["omu-aikido-app"],
          },
      },
  },

  integrations: [sitemap()],
});