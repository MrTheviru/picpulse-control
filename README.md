# PicPulse Control

Dashboard and four-template personalization prepared on 13 October 2026.

## Current result

- A local dashboard with persistent SQLite records, company search, template selection, build states, deployment events, email evidence, replies and activity history.
- Excel .xlsx, CSV and JSON import, with preview, column aliases, rejected-row reporting and updates by lead ID. The Leads sheet is preferred; otherwise the first sheet is used.
- Twenty research records loaded from the supplied PicPulse_Colombo_Leads.xlsx. They are research inputs, not independently reverified facts. All twenty lack business emails. Email, owner-detail, logo and public-preview approvals default to false.
- Four prepared templates preserve source styling and assets while replacing company text and contacts. Unverified demo testimonials, staff, numbers, prices and foreign contact sections are removed or replaced.
- Original files in the user's Automation folder remain untouched. Template copies and application source are in this directory.

The dashboard is deployed at https://picpulse-control.thevirulakwan.workers.dev with D1 database c084cced-145b-4ea6-ac06-8e121e8e4dd5. Twenty leads were imported into D1, and unauthenticated API access returned HTTP 401. Owner credentials were saved through the local setup page, and owner login was verified. Aura Bliss was built successfully on the hosted dashboard. It does not yet report events from the live n8n Cloud workflow. The existing pilot workflow has not been replaced. A new four-template workflow was imported at https://picpulse.app.n8n.cloud/workflow/am1kaAs0tl5VYghY; dedicated API credential entry is pending. No new emails were sent. Cloudflare authentication, D1 provisioning and owner secret setup are complete. n8n workflow credential selection and native execution tests remain.

## Start locally

Use the bundled Node executable:

```sh
/Users/thevirulakwan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node local.mjs
```

Run in this directory and open http://127.0.0.1:8098/. This development server binds to loopback and deliberately bypasses authentication locally. Do not expose it using a tunnel; deploy the authenticated Worker instead. It stops when the process or Mac stops.

## Company personalization

Template mapping: nail_salon → 01-nailsy; hair_beauty_salon → 04-elysia; restaurant → 02-tastyc; café or burger shop → 03-grand-restaurant. A template_override can explicitly select any of the four. Mixed restaurant_cafe categories are classified using company name and listed services; check those ambiguous records in the template selector.

Business input fields include business_name, area, address, business_phone, whatsapp_number, business_email, google_maps_url, services or business_services, description, social links and booking_url. Original-source branding cannot override these inputs because Framer hydration is removed from the compiled Elysia copy. Local motion libraries remain where compatible; animations need visual checks after each compiler change.

Only explicit WhatsApp numbers create WhatsApp links. Missing email, hours, logos and services are marked for confirmation rather than guessed. Services imported from research must still be checked; prices appear only when their price_verified flag is true. opening_hours entries require {day,hours,verified:true}.

For a real logo provide a HTTPS logo_url and set logo_verified only after verifying identity and permission. Without it, a business-name wordmark is used. approved_images entries need HTTPS URLs and permission equal to owner_supplied or licensed. Remaining template imagery is labeled as a design reference. Public templates must have the required commercial/multiple-client licensing before production use.

## Cloudflare free hosting preparation

wrangler.jsonc and schema.sql are prepared for Workers Static Assets and D1. Cloudflare has free tiers with limits; account charges and plans must be checked before changing them. No paid plan is necessary to attempt this small pilot. n8n Cloud billing remains separate.

Once signed in to Cloudflare:

1. Create a D1 database named picpulse-control. Put its real ID in wrangler.jsonc.
2. Apply schema.sql to that database. LOCAL_DEV must never be set on the hosted Worker.
3. Configure API_KEY for authenticated n8n reporting and SESSION_SECRET for signed browser sessions. Configure ADMIN_PASSWORD_HASH as the SHA-256 digest of an owner-chosen strong password. The owner should enter their credential through a trusted setup step; never paste passwords or tokens into workflow JSON or chat.
4. Deploy public/ and worker.mjs using the official Cloudflare tooling. The dashboard and API require authentication; source asset files are public, and individual company previews remain private unless their public_preview value is explicitly changed.
5. Import the seed leads through the authenticated dashboard, verify login, verify that unauthenticated API requests fail, then test a company build.
6. Configure the returned HTTPS origin in both n8n workflow files. Add the console API key as an n8n Bearer Auth credential, preserving the existing separate Netlify and Gmail credentials.

Cloudflare sign-in and email verification were confirmed in the browser. Wrangler 4.149.0 is installed and a deployment dry run passed with 1,501 static assets. QA pages are excluded through public/.assetsignore. Scoped Wrangler device authorization succeeded. The Worker and database are deployed; the owner must complete the temporary loopback setup page to set password and automation API key.

## n8n integration

n8n-four-template-workflow.json is a new inactive workflow based on the existing pilot. It reads dashboard records, calls the authenticated template API, packages per-company HTML into one ZIP, uses the existing Netlify deployment method, and reports ready publications and Gmail acceptance to the console. Assets resolve on the hosted console origin, so that origin must remain available. A batch only contains its selected leads; use separate prospect sites or a complete retained manifest before updating a shared production site, because a Netlify ZIP replaces the site's previous contents.

All hosting and Gmail nodes remain disabled in the portable workflow. Set consoleUrl and select appropriate credentials. Keep sendEmails=false for publishing tests. Public sample accessibility and recipient verification must be completed before sendEmails, gmailConnected and publicLinksVerified are enabled. Dashboard send claims are durable and are not automatically retried after an ambiguous Gmail result. Reconcile Sent before clearing a claim. No credential secrets are in these files.

n8n-reply-monitor.json is a separate inactive inbox monitor. It fetches tracked outbound thread IDs, checks recent inbox metadata, filters to known business threads before reading bodies, then records and deduplicates matched replies. It polls at most fifty messages from the last two days; increase or paginate that limit for higher traffic. It does not copy unrelated inbox bodies. Gmail payload handling and the native node settings must be tested against the actual connected account after import. Replies without an exact known sender require review; explicit opt-outs from the recorded recipient suppress that lead. Automatic replies to customers are not implemented.

The Run automation dashboard button is inactive until N8N_RUN_URL and N8N_RUN_TOKEN exist. The exported website workflow currently has a manual trigger and disabled schedule; an authenticated n8n webhook must be added and verified before configuring those values. Automatic scheduling and the dashboard Run button are separate connection steps.

## Validation

test.mjs exercises company-template routing, escaped content, missing fields, verified logo handling, unauthorized API access, publication prerequisites, send evidence, send locking, reply matching, opt-outs and preservation of build/email history across lead updates. Tests use an isolated in-memory database. Run with the bundled Node executable.

Browser upload test: twenty rows imported from the actual workbook, zero rejected; the existing built status survived the update. Browser build test: Aura Bliss used Nailsy, correct business name, telephone and WhatsApp destination. Further visual verification of all four templates and live Cloudflare/n8n behavior is required before automatic public outreach.

## Native n8n verification on 13 October 2026

The PicPulse Dashboard API credential was saved by the owner and validated with a native HTTP request. The website workflow ran successfully in preview mode in two batches (10 then 9 company pages); 19 eligible records are built. Lilly's Beauty Boutique was excluded because its research record contains an existing Canva website. Selection now processes queued/error records and changed details instead of rebuilding completed records. Website publishing and Gmail sending remain disabled.

The hourly reply monitor at https://picpulse.app.n8n.cloud/workflow/QfpgwEsQYR1rpbxW was imported, connected to the existing Gmail account and published. An empty-outreach test succeeded in 3.233 seconds, ending before Gmail because no outbound threads are registered. Real matched-message ingestion still needs a real tracked reply to verify. The native Gmail Get node's Simplify switch was disabled to provide raw payload/headers.

The website workflow has a connected POST webhook with Header Auth and a configured 9 AM Asia/Colombo schedule. Its publication is pending the owner entering the final PicPulse Dashboard Run header credential. After that, set N8N_RUN_URL to the production webhook shown in n8n and test the dashboard Run button. The Worker uses the existing API_KEY for this request unless N8N_RUN_TOKEN is supplied. Do not use the existing Netlify Header Auth credential for this webhook.

## Final connection verification

The owner saved PicPulse Dashboard Run and the website workflow was published. N8N_RUN_URL is configured. The authenticated dashboard Run-button test succeeded in the production webhook in 3.575 seconds and rebuilt Aura Bliss with recorded building/built events. A request without the key returned HTTP 403. A subsequent manual retry succeeded in 4.707 seconds and selected zero unfinished eligible leads.

The current native exports are n8n-published-website-workflow.json and n8n-published-reply-monitor.json. They contain credential references, not credential values, and no pinned data. Treat these exports as authoritative for current n8n node parameters; the older portable generators are preparation files. Nineteen websites are built; one supplied record has an existing website. No new email sends or public sample publication occurred. Real customer reply ingestion remains unverified because there are no tracked business sends.

### Contact research, 13 October 2026

19 eligible leads were checked. Five emails were confirmed on matching public business Facebook profiles and saved to remote D1 with source URLs, strict boolean email_verified=true and mailbox_tested=false. Three published directory/listing candidates were recorded separately and held outside business_email. Eleven leads had no matching public email found. Remote readback verified all counts, zero sent emails and zero public samples. Existing opt-out, website and email statuses were preserved. Five records are flagged needs_rebuild so n8n can refresh them; dynamic previews already use current data. The CSV and Markdown contact-research-2026-10-13 reports contain the evidence and website-status uncertainties.

### Five public samples and real outreach, 13 October 2026

The owner authorized public access for the five prepared samples (PP-L002, PP-L004, PP-L005, PP-L012, PP-L015) and had requested sending their offers. Only these pages now allow unauthenticated access. All five returned HTTP 200 with personalized emails; the dashboard API and another sample returned HTTP 401. A new manual-only n8n workflow at https://picpulse.app.n8n.cloud/workflow/QIhEncvW51LUu79C sent the exact five prepared offers from the connected PicPulse Gmail account, verified from native Gmail Sent-folder metadata. The credential disallows generic HTTP use, so the sender check uses native Gmail. The first send run stopped safely before claiming or sending because n8n returned HTML in data rather than body; this was fixed. The successful run completed in 29.052s, rebuilding each site, checking unauthenticated HTTP status and personalized content, recording ready publication, claiming a durable initial-email lock, sending via native Gmail, and recording acceptance and message/thread IDs. Remote D1 readback verified five published/accepted_by_gmail leads, five sent locks and five outbound messages. Gmail acceptance does not prove inbox delivery. The native export is n8n-successful-five-send-workflow.json. General automatic outreach remains disabled; the new sender workflow has no recurring trigger. Existing hourly reply monitor can now read these tracked threads. No real customer reply has been verified yet.

### Template presentation repairs, 13 October 2026

All four compiled automation templates were reviewed against the supplied Automation/index.html reference links. Readable wordmarks, bounded approved-logo dimensions, shorter header buttons, responsive long-name headings, cleaned service labels, and duplicate-section removal were added. Frozen Framer start states and duplicate headers were removed; Elysia gallery rows now animate and pause on hover/focus. Tastyc uses its existing Swiper library with navigation/pagination and safe motion. Grand Restaurant configured scale/rotation/translation settings are preserved with first-entry IntersectionObserver reveals and the original 769px desktop-motion breakpoint. Incompatible CMS/commerce runtime initialization was removed from static concept pages. Original reference folders are unchanged. The compiler runs the repair stage after generating templates so subsequent generation keeps the repairs.

Eight representative desktop/mobile browser checks passed with zero broken images or horizontal overflow; full desktop scroll checks passed without visible content stranded hidden. The reviewed browser tab reported no JavaScript errors. Application authentication, send-lock/history, rendering and import regression checks passed. The reviewed changes were deployed through Wrangler as version 608bc63e-084b-4679-ab96-895e2815eba5. All five previously emailed URLs returned unauthenticated HTTP 200, contained the repaired wordmark/runtime and correct email. The dashboard API and an unapproved sample still returned HTTP 401. The dashboard activity log shows templates_updated, five accepted Gmail messages and zero replies. No new emails were sent during this update. Evidence lives in template-review/.

### Personalized service photographs and animations

Version `5f6b6bcd-7f8d-4e05-9860-d16f4522dbbe` restores company-specific Nailsy service accordions with changing photos and Elysia service photo cards with scroll reveals across all five public samples. The Worker and compiler repair stage preserve these layouts for future builds. Owner-supplied or licensed HTTPS photos matched by the `service` field in `approved_images` replace labelled template reference photos automatically. Actual 390px browser layouts, accordion photo changes, regression tests, five public pages and eight photo assets passed checks. See `template-review/service-review.md` and `service-live-checks.json`. No outreach was resent or lead statuses reset.

### Nightly uploads, Sent offers and verification — 21 October 2026

The current build/send workflow is `KTpOcGMDOulqSvLo` with authenticated nightly-upload webhook and hourly backup. Uploads preserve history, deduplicate businesses, and require owner batch approval plus a business-profile email source before new public outreach. Hemys PP-L014 was verified and its offer accepted by Gmail on 16 October; six offers are now recorded. Canapé PP-L013 was excluded after its official website was found. The remaining 12 uncontacted candidates need verified email contacts. The Sent offers dashboard shows business, recipient, Sri Lanka time, status and full message.

The fresh 21 October test found the Cloud trial expired: the reply-monitor manual run was rejected and the dashboard webhook returned HTTP 500. Existing websites and imports still work. Do not describe the configured workflows as confirmed operational until the account is reactivated and a fresh run passes. Dashboard run/import failure feedback now survives automatic refresh, and failed Run requests appear in Activity log. Version `a4931b26-119c-4a18-ba3a-43333e70852d` is deployed. See `full-test-2026-10-21.md` for passes, blockers and unverified paths. No new emails were sent during that verification.
