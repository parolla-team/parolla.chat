import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from '@astrojs/mdx';
import react from "@astrojs/react";
import remarkUnwrapImages from 'remark-unwrap-images'
import remarkEleventyImage from "astro-remark-eleventy-image";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind({applyBaseStyles: false}), mdx(), react(), remarkEleventyImage()],
  i18n: {
    defaultLocale: "fr",
    locales: ["co", "fr"],
    routing: {
      prefixDefaultLocale: false
    }
  },
  markdown: {
    remarkPlugins: [
      remarkUnwrapImages
    ]
  },
});