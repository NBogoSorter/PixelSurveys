# Pixel Surveys website

Static marketing site built with [Astro](https://astro.build), hosted on VentraIP
Business Hosting (shared cPanel). The build outputs plain HTML/CSS/images. The only
server-side code is `public/api/quote.php`, which handles the quote form.

## Local development

Requires Node 22.12+.

```sh
npm install
npm run dev       # http://localhost:4321 with live reload
npm run build     # type-check + build to dist/
npm run preview   # serve dist/ locally
```

Stop `npm run preview` before running `npm run build` again. Rebuilding while preview
has `dist/` open on Windows can produce a page with no CSS.

`quote.php` doesn't run locally (the dev server doesn't execute PHP). Test the form on staging.

## Project layout

| Path                                   | What it is                                                          |
| -------------------------------------- | ------------------------------------------------------------------- |
| `src/pages/`                           | One file per URL (`services.astro` → `/services/`)                  |
| `src/components/`                      | Header, footer, hero, service cards, quote form                     |
| `src/data/services.ts`                 | Service categories and bullet copy. Edit copy here                  |
| `src/styles/global.css`                | Brand tokens (colors sampled from the logo), base styles            |
| `src/assets/`                          | Images optimized at build time (logo, later service/hero photos)    |
| `public/.htaccess`                     | HTTPS/www redirects, security + cache headers, 404                  |
| `public/api/quote.php`                 | Quote form handler                                                  |
| `server-config/quote-config.example.php` | Template for the form's server-side settings (never deployed)     |
| `media/`                               | Original source assets                                              |

### Adding photos

- **Service cards:** put images in `src/assets/services/`, `import` them in
  `src/data/services.ts`, and set `image` + `imageAlt` on each service. The gradient
  placeholder disappears automatically.
- **Hero:** see the comment in `src/components/Hero.astro`.

## One-time VentraIP setup

Do these in cPanel, in order.

1. **Back up the current WordPress site.** cPanel → Backup → download a full account backup.
   Keep it until the new site has been live and checked.
2. **Create the mailboxes** the form uses (cPanel → Email Accounts), e.g.
   `website@pixelsurveys.com` (sender) and the inbox that receives quotes.
3. **Create the staging subdomain** (cPanel → Domains) `staging.pixelsurveys.com`. Let
   cPanel put its document root outside `public_html` (e.g. `~/staging.pixelsurveys.com`).
4. **Create the form config** outside every web root:
   - cPanel → File Manager → in your home directory create `server-config/`
   - Upload `server-config/quote-config.example.php` there, rename it to `quote-config.php`,
     and fill in real addresses.
5. **Create two FTP accounts** (cPanel → FTP Accounts), each limited to one document root:
   - `deploy-staging@…` → the staging subdomain's folder
   - `deploy-prod@…` → `public_html`
6. **GitHub:** repo → Settings → Environments → create `staging` and `production`, each
   with secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (usually `./`).
   Under `production`, add yourself as a required reviewer so production deploys need approval.

## Deploying

- **Push to `main`** → GitHub Actions builds and uploads to **staging**.
- **Production:** GitHub → Actions → "Build & deploy" → Run workflow → target `production`.

Deploys only upload changed files, and only ever delete files a previous deploy uploaded.

### First production deploy (replacing WordPress)

The deploy won't delete WordPress's files, because it didn't upload them. After the backup
from step 1 and a successful first production deploy, remove the leftover WordPress files
from `public_html` (`wp-admin/`, `wp-content/`, `wp-includes/`, `wp-*.php`, `index.php`,
`xmlrpc.php`). `index.html` already takes priority over `index.php`, so the new site shows
immediately, but stale WordPress PHP stays reachable until those files are removed.

## Checklist after each deploy

- [ ] Pages load over HTTPS; `www.` and `http://` redirect to `https://pixelsurveys.com`
- [ ] `/services`, `/about`, `/contact` load (with and without trailing slash)
- [ ] A made-up URL shows the custom 404 page
- [ ] Quote form delivers an email with Reply-To set to the visitor
- [ ] Form works with JavaScript disabled (redirects to `/contact/thanks/`)
