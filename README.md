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
| `src/pages/`                             | One file per URL (`services/index.astro` → `/services/`)         |
| `src/pages/services/`                    | Services hub plus per-service detail pages                       |
| `src/components/`                        | Header, footer, hero, service cards, quote form                  |
| `src/data/services.ts`                   | Service categories and bullet copy. Edit copy here               |
| `src/styles/global.css`                  | Brand tokens (colors sampled from the logo), base styles         |
| `src/assets/`                            | Images optimized at build time (logo, later service/hero photos) |
| `public/.htaccess`                       | HTTPS/www redirects, security + cache headers, 404, pre-launch gate |
| `src/pages/maintenance.astro`            | The public "coming soon" page (see [Pre-launch gate](#pre-launch-gate)) |
| `public/api/quote.php`                   | Quote form handler - sends via Graph API, see comment at its top |
| `server-config/quote-config.example.php` | Template for the form's settings incl. Entra app credentials (never deployed) |
| `scripts/linkcheck.py`                   | Checks every internal link in `dist/` after a build               |
| `scripts/check-service-types.py`         | Checks the form's service options match what quote.php accepts    |
| `media/`                                 | Original source assets                                           |

### Adding photos

- **Service cards:** put images in `src/assets/services/`, `import` them in
  `src/data/services.ts`, and set `image` + `imageAlt` on each service. The placeholder
  disappears automatically.
  - Each service also has an `imageBrief` - a short description of the shot that card
    needs. While `image` is undefined, the services page renders that text inside the
    placeholder, so **the page itself is the photo brief** to send the client. Four
    photos are needed in total, one per category.
  - The homepage cards keep a plain brand-gradient placeholder instead: at four-across
    the labelled version is too noisy, and at that size a gradient reads as a design
    device rather than a mistake.
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
4. ~~**Create an FTP account**~~ **Done.** Scoped to `public_html`, so `FTP_SERVER_DIR`
   is `./`. Confirmed working by a successful deploy.
5. **GitHub environment** - secrets are done, the approval gate is **not**. The
   `production` environment exists with `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
   and `FTP_SERVER_DIR` set, but no required reviewer took effect, so **every push to
   `main` deploys straight to the live site with no approval step**. To fix: Settings →
   Environments → `production` → tick **Required reviewers**, add yourself, then click
   **Save protection rules** (adding the reviewer without saving is the easy mistake).

There's no staging subdomain in this setup. `staging.pixelsurveys.com.au` exists in
cPanel (an old WordPress staging copy) but is intentionally untouched and unrelated to
this project - the client previews the in-progress site via the pre-launch gate below,
on the production domain itself.

## Deploying

Push to `main` → GitHub Actions builds and deploys to **production**. Re-run the
workflow manually (Actions → "Build & deploy" → Run workflow) to redeploy without a new
commit.

**There is currently no approval step** - see step 5 above. Until that's fixed, a push
to `main` is a deploy to the live site.

Deploys only upload changed files, and only ever delete files a previous deploy uploaded.

## Before launch

Things that are fine while only the client is previewing behind the gate, but must not
be live when the site opens to the public.

- [x] ~~**Literal placeholder text in the quote email subject.**~~ Closed 29 Sept
      2026. The agreed format was `Quote Request: <service> – [Site Location] |
      [Quote Number]`, locked in before either value existed, and both were
      shipping as literal bracketed text. Both dropped rather than built: the site
      location field had been taken out of the form at the client's request, and a
      reference number needs either a locked counter file or a scheme that would
      not line up with the client's own quote register. The subject is now
      `Quote Request: <service>`. Everything the form collects is in the body, and
      Reply-To is the sender, so nothing is lost. If a location or reference is
      wanted later, add the form field first and the subject second.
- [ ] **The hero and service cards have no real photos.** Every other slot on the
      main pages now carries the client's own words. The `imageBrief` field on each
      entry in `src/data/services.ts` doubles as the shot list. (Phone number
      supplied 28 Sept 2026; About page copy written 28 Sept 2026 - it renders the
      same `IntroSection` as the homepage, so the two cannot drift.)
- [x] ~~**The phone number mixes dialling conventions.**~~ Closed 30 Sept 2026.
      It read `+61 0461 370 270`, which was valid neither way: `+61` is the
      international prefix and the `0` after it is the domestic trunk prefix,
      dropped when dialling from overseas. The `+61` came off, leaving the correct
      domestic `0461 370 270`. `tel:` links still use `CONTACT_PHONE_DIAL`
      (`+61461370270`), so an overseas caller tapping the number still connects.
- [ ] **The site no longer states a turnaround anywhere.** Our *"within three
      working days"* placeholder was dropped in that rewrite and nothing replaced
      it, so a visitor cannot find out how long delivery takes. Safer than an
      unverified promise, but check the omission is deliberate rather than an
      oversight. (The other dropped question, flying near Adelaide Airport and
      Parafield, is at least partly covered under *"What kinds of sites can you
      survey?"*.)
- [ ] **The FAQ is the only page claiming interstate work.** The client's own answer
      to *"Where in Australia do you work?"* says *"across South Australia and
      interstate"*, while the hero reads *"Adelaide based. Servicing sites across
      South Australia"* and the footer *"Drone survey and mapping services across
      South Australia."* A visitor outside SA bounces off the hero long before the
      FAQ. Ask which is right, then make all three agree.
- [x] ~~**Unverified figures, dead links and image placeholders on the orthomosaic
      page.**~~ Closed 29 Sept 2026 by deleting the page. It had been orphaned since
      its `href` came out of `src/data/services.ts`, and it carried an illustrative
      GSD table presented as real capture data, two literal `[XX]` placeholders, a
      satellite-imagery comparison nobody had checked, a claim that every project is
      flown with RTK or PPK, seven links to pages that do not exist, eleven image
      slots and an iframe slot. It was the riskiest content on the site and nothing
      pointed at it. Recover it from git history if a detail page is wanted later.
- [ ] **No service has a detail page.** All ten render as plain text on the hub
      rather than links, so nothing points at a 404. A service becomes a link the
      moment you give it an `href` in `src/data/services.ts` - add the page first.
      `python scripts/linkcheck.py dist` re-checks every internal link after a build.
- [ ] **Remove the pre-launch gate itself** - see below.

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
- **The cookie is per browser and per device.** A laptop that has it does nothing for
  the same person's phone, and Chrome having it does nothing for Safari. It is also
  lost when an incognito window closes, or when site data is cleared. Each device
  they want to view the site on has to open the token link once. It lasts 180 days.
- **The symptom when a device lacks it is confusing**, and cost a round trip with the
  client on 29 Sept 2026: they reported *"I can't see the footer."* `RewriteRule ^
  /maintenance/ [L]` is an **internal rewrite, not a redirect**, so the address bar
  still shows `/contact/` or whatever was requested while the maintenance page is
  served - and that page is the only one in the build with no header and no footer.
  Quickest way to confirm it: ask what the top of the page says. "Something new is
  on the way" settles it.
- **Anything that checks the live site has to carry the token**, including scripts.
  A `curl` of the plain domain returns the maintenance page every time, so a
  post-deploy check written against the bare URL will never see a change land and
  will report a failure that isn't real.
- The token lives in `public/.htaccess` and therefore in this repo, so treat it as
  readable by anyone with repo access. That's acceptable for what it does - it keeps
  an unfinished site out of public view, it doesn't protect anything sensitive. To
  change it, replace it in **both** places in `public/.htaccess` (the `RewriteCond`
  and the `Set-Cookie` header) - they have to match - then redeploy.
- **To launch for real:** delete the whole "Pre-launch gate" block in
  `public/.htaccess` (both directives), then redeploy.

### Leftover WordPress - OUTSTANDING, and not where this file said it was

**Correction, 29 Sept 2026.** Every earlier probe in this section was a false
positive. They tested the apex domain and read status codes without reading
bodies. The pre-launch gate rewrites any URL it does not recognise to
`/maintenance/`, which returns **200** - so `/xmlrpc.php`, `/wp-json/`,
`/readme.html`, `/license.txt` and every `wp-*.php` all "responded", each with
the same 3,568-byte maintenance page. `public_html` is clean and has been.
`/wp-admin/` returning 404 while everything around it returned 200 was the
tell, and it was not followed up.

**The install is real, but it lives on `staging.pixelsurveys.com.au`**, a
separate subdomain with its own document root, which the deploy never touches
and the pre-launch gate never covers. Probed 29 Sept 2026:

| Path on staging | Status | |
| ---- | ------ | ------ |
| `/wp-login.php` | 200 | real WordPress login form, publicly reachable |
| `/wp-json/` | 200 | REST API live, 432kB route index |
| `/wp-json/wp/v2/` | 200 | core routes exposed |
| `/readme.html` | 200 | discloses the version |
| `/wp-cron.php` | 200 | |
| `/license.txt` | 200 | |
| `/wp-admin/` | 302 | redirects to the login form |
| `/xmlrpc.php` | 405 | rejects GET; POST is the attack path |
| `/` | 200 | masked by a maintenance-mode plugin |

WordPress 7.1.2, per the generator meta tag. The maintenance plugin only covers
the front end - every file above bypasses it. Nobody is patching this, which is
the worst state to leave an install in.

**To close it:** cPanel > Domains, remove the `staging.pixelsurveys.com.au`
subdomain, then File Manager and delete its document root folder - removing the
subdomain does not always delete the files behind it. A full cPanel backup was
taken 29 Sept 2026 before this, so the old site's content and media are
recoverable from there if anyone wants them.

Afterwards the whole table should fail to resolve. Probe the staging hostname,
not the apex, and check response **bodies**, not just status codes.

## Checklist after each deploy

Run against production 29 Sept 2026, behind the pre-launch gate. Everything
below passed except the email delivery line, which needs a real submission and
so has still never been tested end to end. Two things worth knowing:

- **`http://www.` takes two redirect hops**, not one: it goes to `https://www.`
  first and only then to the apex, because the HTTPS rule runs before the
  canonical-host rule. Harmless, but one hop is free if the rules are merged.
- **The custom 404 page is masked while the gate is active.** The status code is
  correct - a missing URL returns 404 - but the body anyone without the preview
  cookie sees is the maintenance page, because `ErrorDocument` re-enters as an
  internal request that carries no `?preview=` query string. With the cookie the
  real page renders. This resolves itself when the gate block is deleted; re-check
  it then.


- [ ] Pages load over HTTPS; `www.` and `http://` redirect to `https://pixelsurveys.com.au`
- [ ] `/services`, `/about`, `/contact` load (with and without trailing slash)
- [ ] A made-up URL shows the custom 404 page
- [ ] Quote form delivers an email with Reply-To set to the visitor, and it lands in
      the inbox, not junk (worth an eye the first few times - new senders on a mailbox
      sometimes get filtered even when SPF/auth all check out)
- [ ] Form works with JavaScript disabled (redirects to `/contact/thanks/`)
- [ ] If the pre-launch gate is still active: the plain domain shows the maintenance
      page, and `?preview=<token>` unlocks the real site. Verified against live Apache
      29 Sept 2026 - the token sets `preview_access`, and a later plain request
      carrying that cookie returns the real page.
