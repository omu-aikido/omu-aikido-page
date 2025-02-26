// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://omu-aikido.com",

    redirects: {
        "/signin": "https://app.omu-aikido.com/sign-in",
    },

    adapter: cloudflare({
        platformProxy: { enabled: true },
    }),

    integrations: [sitemap()],
});