// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://pixelsurveys.com.au",
  output: "static",
  // Emits /services/index.html etc. Apache serves these as /services/ with no
  // rewrite rules, and mod_dir redirects /services -> /services/ on its own.
  // trailingSlash "always" keeps dev-server links matching that canonical form.
  build: { format: "directory" },
  trailingSlash: "always",
  // Generated from the pages that actually exist, so it cannot drift the way a
  // hand-written list would. Emits /sitemap-index.xml pointing at
  // /sitemap-0.xml - the index is the URL to give Search Console and robots.txt.
  integrations: [
    sitemap({
      // Excluded, and each carries its own noindex:
      //   /maintenance/        the coming-soon page, not part of the site
      //   /contact/thanks/     only reachable after submitting the form
      //   /contact/error/      same, on failure
      // The last two are thin by design and make no sense as a search result -
      // someone landing on "your request has been sent" from Google has sent
      // nothing.
      filter: (page) =>
        !["/maintenance/", "/contact/thanks/", "/contact/error/"].some((path) =>
          page.includes(path),
        ),
    }),
  ],
});
