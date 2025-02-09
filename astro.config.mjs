// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    output: "static",
    site: "https://omu-aikido.com",
    redirects: {
        "/signin": "https://accounts.omu-aikido.com/sign-in",
    },
    adapter: cloudflare({
        platformProxy: { enabled: true },
    }),
    vite: {
        build: {
            rollupOptions: {
                external: ["omu-aikido-app"],
            },
        },
    },
});
