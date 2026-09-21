# Pixel Surveys website

Static marketing site built with [Astro](https://astro.build), hosted on VentraIP
Business Hosting (shared cPanel). The build outputs plain HTML/CSS/images. The only
server-side code is `public/api/quote.php`, which handles the quote form - it sends via
the Microsoft Graph API, since pixelsurveys.com.au's email is hosted on Microsoft 365
with a hard-fail SPF record (mail sent any other way gets rejected as spoofed), and
Graph is Microsoft's own recommended replacement for the SMTP-with-a-password approach
they're retiring (existing tenants lose it 31 Dec 2026).

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
| `public/api/quote.php`                   | Quote form handler - sends via Graph API, see comment at its top |
| `server-config/quote-config.example.php` | Template for the form's settings incl. Entra app credentials (never deployed) |
| `media/`                                 | Original source assets                                           |

### Adding photos

- **Service cards:** put images in `src/assets/services/`, `import` them in
  `src/data/services.ts`, and set `image` + `imageAlt` on each service. The gradient
  placeholder disappears automatically.
- **Hero:** see the comment in `src/components/Hero.astro`.

## One-time VentraIP setup

Do these in cPanel, in order.

1. ~~Back up the current WordPress site.~~ Skipped - client's call.
2. ~~**Register an Entra ID app**~~ **Done.** App is "Pixel Surveys Website Mail";
   its tenant ID, client ID, thumbprint and private key are already in the server
   config from step 3. Verified working - a token request against the live tenant
   returned `roles: ["Mail.Send"]`, so admin consent is granted and the certificate
   is accepted. **The certificate expires ~20 Sept 2028**; regenerate and re-upload
   it before then or the form quietly stops sending. The original steps, for when
   that renewal comes around or the app ever needs rebuilding:
   - Entra admin center (entra.microsoft.com) → **App registrations** → **New
     registration**. Name it something like "Pixel Surveys Website Mail". Leave the
     other defaults.
   - Copy the **Application (client) ID** and **Directory (tenant) ID** off the app's
     Overview page - both go in `quote-config.php` in step 3.
   - **API permissions** → **Add a permission** → **Microsoft Graph** → **Application
     permissions** (not Delegated - nobody signs in here) → search `Mail.Send` → add it.
   - Back on the API permissions page, click **Grant admin consent for [tenant]** - the
     permission doesn't actually work until this is clicked.
   - **Certificates & secrets** → **Certificates** tab → **Upload certificate** → upload
     the **public** half of the key pair (a `.cer`/`.pem` file - never the private key).
     This tenant blocks apps from creating client secrets at all, so it's certificate
     auth instead - Claude generated a real key pair for this; get both files from it,
     it never puts the private half anywhere committed to git.
   - After the upload, Entra shows a **Thumbprint** for the certificate - that's the
     third value for step 3, alongside the tenant/client IDs.
   - The generated certificate is valid for 2 years (until ~Sept 2028) - a reminder
     to regenerate and re-upload it before then, or the form quietly stops sending.
   - *Optional hardening:* by default this app can send mail as **any** mailbox in the
     tenant, not just `info@`. Restricting it to just that one mailbox needs an Exchange
     Online PowerShell **Application Access Policy** - worth doing eventually, not a
     blocker to get the form working first.
3. **Create the form config** outside every web root:
   - cPanel → File Manager → in your home directory create `server-config/`
   - Upload `server-config/quote-config.example.php` there, rename it to `quote-config.php`
   - Fill in `graph_tenant_id`, `graph_client_id`, `graph_cert_thumbprint` from step 2,
     and `graph_private_key` with the **private** key file's contents (the one that never
     goes to Entra - paste the whole `-----BEGIN PRIVATE KEY-----` block)
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
- **The current preview link is**
  `https://pixelsurveys.com.au/?preview=qRWAlfZm5naV5SY5QjBp6X2b`
- The token lives in `public/.htaccess` and therefore in this repo, so treat it as
  readable by anyone with repo access. That's acceptable for what it does - it keeps
  an unfinished site out of public view, it doesn't protect anything sensitive. To
  change it, replace it in **both** places in `public/.htaccess` (the `RewriteCond`
  and the `Set-Cookie` header) - they have to match - then redeploy.
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
