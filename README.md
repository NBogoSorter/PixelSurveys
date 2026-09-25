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

- [ ] **The quote email subject contains literal placeholder text.** It currently reads
      `Quote Request: <service> – [Site Location] | [Quote Number]`, where those two
      bracketed strings are literal, not values. The agreed format was locked in before
      either existed. To finish it:
      - **Site location** - the field was removed from the form at the client's request,
        so it needs adding back (a "Site location / suburb" input) before it can appear.
      - **Quote number** - no reference numbering exists. Decide sequential (a locked
        counter file outside the web root) versus stateless (date + random). Worth
        labelling it a reference rather than a quote number unless it's meant to match
        the client's actual quote register in their accounting system.
      - Until both are done, a real customer enquiry arrives with `[Site Location]`
        visible in the subject line.
- [ ] **Capabilities draft A vs B** are both still on the homepage with visible
      "Draft A"/"Draft B" labels. Pick one and delete the other.
- [ ] **`/contact/` uses a different form** (`QuoteForm.astro`) to the homepage's
      `ContactFormB.astro`. Both work, but they will drift apart as copy changes.
- [ ] **Placeholder content**: `CONTACT_PHONE` in `src/data/contact-info.ts` is still
      `+61 0000 000 000`, the hero and service cards have no real photos, the About page
      copy is unwritten, and the "Monitoring & Progress" FAQ answer is an unfinished
      sentence.
- [ ] **Two service descriptions are missing.** `src/data/services.ts` carries the
      client's own copy (supplied 25 Sept 2026), except **Site Progress Monitoring** and
      **Asset & Structure Monitoring**, which their list left blank. Both render
      `[description to come]` on the page rather than invented copy. Chase the client.
- [ ] **The services page and the contact form use different names for the same
      categories.** The client's new service names only partly match the dropdown on the
      contact form:

      | Contact form (`src/data/service-types.ts`) | Services page (`src/data/services.ts`) |
      | ------------------------------------------ | -------------------------------------- |
      | Aerial Imagery & Mapping                    | Aerial Imagery & Mapping (match)       |
      | Contours & Terrain **Data**                 | Contours & Terrain **Models**          |
      | **3D Point Clouds & Models**                | **3D Models & Point Clouds**           |
      | Volumes & Site Monitoring                   | Volumes & Site Monitoring (match)      |

      Two match, two differ by a word. Worth settling on one set of names. **If you
      change `service-types.ts`, you must change `ALLOWED_SERVICES` in
      `public/api/quote.php` to match exactly** - the handler drops any submitted value
      not on that list, silently, so a mismatch loses the service field on every
      enquiry without any visible error.
- [ ] **Only one of the ten services has a detail page.**
      `/services/orthomosaic-mapping/` exists; the other nine render as plain text on
      the hub, not links, so nothing points at a 404. A service becomes a link the
      moment you give it an `href` in `src/data/services.ts` - add the page first.
- [ ] **The orthomosaic page carries unverified figures presented as fact.** This is
      the riskiest content on the site, because it reads as authoritative:
      - The GSD table's capture heights and cm/px figures are illustrative, **not real
        capture data**. Replace with the client's own.
      - `[XX] mm` typical horizontal accuracy, and `[XX] hectares` per flight in the
        FAQ, are literal placeholders visible on the page.
      - The FAQ claims "2-3 cm per pixel against roughly 15-50 cm for public satellite
        imagery" - check the client is happy standing behind that comparison.
      - The page states every project is flown with RTK or PPK and surveyed ground
        control. Confirm that's actually true of how they work.
- [ ] **Seven links on the orthomosaic page go nowhere** - six `/applications/*` URLs
      and `/services/survey-control-gnss/`. They were specified as plausible URLs for
      pages that don't exist yet. Either build them, or drop the links.
      `python scripts/linkcheck.py dist` re-checks every internal link after a build.
- [ ] **The orthomosaic page has eleven image placeholders and one iframe slot**, each
      labelled with the shot it needs. The "Sample output" section expects an
      interactive map viewer embed - see the EMBED POINT comment in the page source.
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
- The token lives in `public/.htaccess` and therefore in this repo, so treat it as
  readable by anyone with repo access. That's acceptable for what it does - it keeps
  an unfinished site out of public view, it doesn't protect anything sensitive. To
  change it, replace it in **both** places in `public/.htaccess` (the `RewriteCond`
  and the `Set-Cookie` header) - they have to match - then redeploy.
- **To launch for real:** delete the whole "Pre-launch gate" block in
  `public/.htaccess` (both directives), then redeploy.

### Leftover WordPress files - OUTSTANDING

The first deploy landed on 21 Sept 2026. The new site serves correctly, but the old
WordPress install is **still present and still executing PHP**, because the deploy only
removes files it uploaded itself. Probed live after that deploy:

| Path | Status |
| ---- | ------ |
| `/xmlrpc.php` | 200 - brute-force amplification and pingback DDoS surface |
| `/readme.html` | 200 - discloses the WordPress version |
| `/wp-json/` | 200 - REST API live, allows user enumeration |
| `/wp-admin/` | 302 - login still reachable |

Nobody is patching this install any more, which is the worst state to leave one in.
Delete from `public_html`: `wp-admin/`, `wp-content/`, `wp-includes/`, `wp-*.php`,
`index.php`, `xmlrpc.php`, `readme.html`, `license.txt`. Leave everything else - the
deployed site's files and `.htaccess` are separate. Re-run the probes above afterwards;
all four should 404.

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
