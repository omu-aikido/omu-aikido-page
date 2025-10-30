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

  output: "static",

  prefetch: {
    defaultStrategy: "hover",
  },

  trailingSlash: "ignore",

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
        "大阪公立大学で活動する体育会所属の合気道団体である、大阪公立大学合氣道部のホームページです。\nなお、当団体は「大阪公立大学合氣道部」であり、「大阪公立大学体育会合気道部」とは別の団体です。",
    }),
  ],
})
