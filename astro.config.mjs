// @ts-check
import { defineConfig } from "astro/config"

import cloudflare from "@astrojs/cloudflare"

import react from "@astrojs/react"

import mdx from "@astrojs/mdx"

import tailwindcss from "@tailwindcss/vite"

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: "passthrough",
  }),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), mdx()],
})
