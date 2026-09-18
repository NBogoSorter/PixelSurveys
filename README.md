# Pixel Surveys website

Static marketing site built with [Astro](https://astro.build), hosted on VentraIP
Business Hosting (shared cPanel). The build outputs plain HTML/CSS/images. The only
server-side code is `public/api/quote.php`, which handles the quote form - it sends
via authenticated SMTP through Microsoft 365, since pixelsurveys.com.au's email is
hosted there and its SPF record (`-all`, a hard fail) rejects mail sent any other way.

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

`quote.php` doesn't run locally (the dev server doesn't execute PHP). Test the form after
a real deploy - there's no staging environment (see [Deploying](#deploying)), so that
means testing on production, behind the pre-launch gate.

## Project layout

| Path                                     | What it is                                                       |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `src/pages/`                             | One file per URL (`services.astro` → `/services/`)               |
| `src/components/`                        | Header, footer, hero, service cards, quote form                  |
| `src/data/services.ts`                   | Service categories and bullet copy. Edit copy here               |
| `src/styles/global.css`                  | Brand tokens (colors sampled from the logo), base styles         |
| `src/assets/`                            | Images optimized at build time (logo, later service/hero photos) |
| `public/.htaccess`                       | HTTPS/www redirects, security + cache headers, 404, pre-launch gate |
| `src/pages/maintenance.astro`            | The public "coming soon" page (see [Pre-launch gate](#pre-launch-gate)) |
| `public/api/quote.php`                   | Quote form handler - sends via M365 SMTP, see comment at its top |
| `public/api/lib/phpmailer/`              | Vendored PHPMailer (no Composer on this host) - don't hand-edit  |
| `server-config/quote-config.example.php` | Template for the form's settings incl. mailbox credentials (never deployed) |
| `media/`                                 | Original source assets                                           |

### Adding photos

- **Service cards:** put images in `src/assets/services/`, `import` them in
  `src/data/services.ts`, and set `image` + `imageAlt` on each service. The gradient
  placeholder disappears automatically.
- **Hero:** see the comment in `src/components/Hero.astro`.

## One-time VentraIP setup

Do these in cPanel, in order.

1. ~~Back up the current WordPress site.~~ Skipped - client's call.
2. **Enable Authenticated SMTP on the `info@pixelsurveys.com.au` mailbox** (this is on
   Microsoft 365, not cPanel): M365 admin center → Users → `info@pixelsurveys.com.au` →
   Mail → Manage email apps → turn on **Authenticated SMTP**. Off by default on most
   tenants. If the mailbox has MFA enabled, its normal password won't work over SMTP -
   generate an **app password** instead (the same user's page → Authentication methods)
   and use that in step 3 below. If sign-in still fails after both of those, the tenant
   likely has Security Defaults or a Conditional Access policy blocking basic auth
   entirely - that needs OAuth2 (XOAUTH2) instead, a bigger change; only chase that if
   plain SMTP AUTH turns out to actually be blocked, not pre-emptively.
3. **Create the form config** outside every web root:
   - cPanel → File Manager → in your home directory create `server-config/`
   - Upload `server-config/quote-config.example.php` there, rename it to `quote-config.php`
   - Fill in `smtp_password` with the mailbox's password or app password from step 2
4. **Create an FTP account** (cPanel → FTP Accounts) limited to `public_html`:
   `deploy-prod@pixelsurveys.com.au` (or similar).
5. **GitHub:** repo → Settings → Environments → create a `production` environment with
   secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (usually `./`).
   Add yourself as a required reviewer so every deploy needs an approval click.

There's no staging subdomain in this setup. `staging.pixelsurveys.com.au` exists in
cPanel (an old WordPress staging copy) but is intentionally untouched and unrelated to
this project - the client previews the in-progress site via the pre-launch gate below,
on the production domain itself.

## Deploying

Push to `main` → GitHub Actions builds and deploys straight to **production**, gated by
the `production` environment's required-reviewer approval (so it builds automatically,
but nothing reaches the live site until that approval click). Re-run the workflow
manually (Actions → "Build & deploy" → Run workflow) to redeploy without a new commit.

Deploys only upload changed files, and only ever delete files a previous deploy uploaded.

## Pre-launch gate

Until the site is ready to go public, `public/.htaccess` shows everyone the "coming
soon" page at `/maintenance/` instead of the real site. Whoever opens
`https://pixelsurveys.com.au/?preview=<token>` once gets a cookie that unlocks the real
site in that browser from then on; the plain domain still shows the maintenance page
for everyone else, including search engines (it's marked `noindex`). This is how the
client previews the real, in-progress site - there's no separate staging URL for that.

- **Send the client the `?preview=` link, not the plain domain**, while this is active.
- **The token in `.htaccess` right now is only an example.** It's been sitting in this
  chat and will be in git history the moment this file is committed - treat it as
  already public. Before this goes anywhere near a real deploy, pick a new random
  string and replace it in **both** places it appears in `public/.htaccess` (the
  `RewriteCond` and the `Set-Cookie` header) - they have to match.
- **To launch for real:** delete the whole "Pre-launch gate" block in
  `public/.htaccess` (both directives), then redeploy.

### First production deploy (replacing WordPress)

The deploy won't delete WordPress's files, because it didn't upload them. After a
successful first deploy, remove the leftover WordPress files from `public_html`
(`wp-admin/`, `wp-content/`, `wp-includes/`, `wp-*.php`, `index.php`, `xmlrpc.php`).
`index.html` already takes priority over `index.php`, so the new site shows immediately,
but stale WordPress PHP stays reachable until those files are removed.

## Checklist after each deploy

- [ ] Pages load over HTTPS; `www.` and `http://` redirect to `https://pixelsurveys.com.au`
- [ ] `/services`, `/about`, `/contact` load (with and without trailing slash)
- [ ] A made-up URL shows the custom 404 page
- [ ] Quote form delivers an email with Reply-To set to the visitor, and it lands in
      the inbox, not junk (worth an eye the first few times - new senders on a mailbox
      sometimes get filtered even when SPF/auth all check out)
- [ ] Form works with JavaScript disabled (redirects to `/contact/thanks/`)
- [ ] If the pre-launch gate is still active: the plain domain shows the maintenance
      page, and `?preview=<token>` unlocks the real site (check the cookie's actually
      set - this hasn't been tested against real Apache yet, only reasoned through)
