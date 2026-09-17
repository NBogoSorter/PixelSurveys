// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pixelsurveys.com",
  output: "static",
  // Emits /services/index.html etc. Apache serves these as /services/ with no
  // rewrite rules, and mod_dir redirects /services -> /services/ on its own.
  // trailingSlash "always" keeps dev-server links matching that canonical form.
  build: { format: "directory" },
  trailingSlash: "always",
});
