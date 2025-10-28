// @ts-check
import { defineConfig } from "astro/config"

import cloudflare from "@astrojs/cloudflare"

import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

import mdx from "@astrojs/mdx"

import sitemap from "@astrojs/sitemap"
import astroLLMsGenerator from "astro-llms-generate"

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },

    imageService: "passthrough",
  }),

  site: import.meta.env.PROD
    ? "https://omu-aikido.com"
    : "http://localhost:4321",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    mdx(),
    sitemap(),
    astroLLMsGenerator({
      title: "大阪公立大学合氣道部",
      description:
        "大阪公立大学で活動する体育会所属の合気道部である、大阪公立大学合氣道部のホームページです",
    }),
  ],
})
