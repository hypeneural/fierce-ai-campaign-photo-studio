# Plesk deployment model

Target host: `apoio.etijucas.com.br`.

## Decision

The public photo studio is deployed as a **static Next.js export**, not as a Next.js Node runtime inside Plesk.

Why:

- the current product flow is browser-first and does not require a server to generate images;
- Plesk currently states that Next.js is not officially supported as a managed application runtime;
- static export is officially supported by Next.js and can be hosted by any standard web server;
- this avoids Passenger/port/startup-file issues and lowers memory/runtime risk on shared hosting;
- it keeps the user's photo inside the browser.

Official references:

- Plesk: https://support.plesk.com/hc/en-us/articles/12376965359511-Does-Plesk-support-Next-JS
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- Plesk remote Git hosting: https://docs.plesk.com/en-US/obsidian/customer-guide/git-support/using-remote-git-hosting.75848/

## Recommended pipeline

```text
Developer / Antigravity
        |
        v
      main
        |
        v
GitHub Actions: validate + build
        |
        v
 generated `plesk` branch (static `out/` only)
        |
        v
Plesk Git remote repository
        |
        v
apoio.etijucas.com.br document root
```

Plesk should track the generated `plesk` branch. The `plesk` branch is disposable deployment output and is never edited manually.

This model deliberately builds outside the hosting server. It avoids relying on Node/npm paths inside CageFS/chroot and reduces slow small-file build I/O on the shared server.

## Plesk Git setup

1. In `apoio.etijucas.com.br` open **Git > Add Repository**.
2. Select **Remote Git hosting**.
3. Use the GitHub repository SSH URL for a private repository.
4. Add the Plesk-generated SSH public key to the GitHub repository as a read-only deploy key.
5. Set active branch to `plesk` after the branch exists.
6. Set the deployment path to the subdomain document root.
7. Start with **Manual deployment** until staging validation passes.
8. Copy the Plesk webhook URL and add it to GitHub only after the manual deployment path is proven.
9. Change to automatic deployment only after rollback has been tested.

Do not store a GitHub personal access token in repository files or deployment scripts.

## DNS finding from supplied Plesk screenshots

The supplied subdomain DNS screen shows a separate zone for `apoio.etijucas.com.br` containing its own NS records such as `ns1.apoio.etijucas.com.br` and `ns2.apoio.etijucas.com.br`, while the desired web A record points to `186.209.113.134`.

A separate subdomain zone only becomes authoritative on the public Internet when the parent zone delegates the subdomain to those nameservers. If the parent `etijucas.com.br` zone remains authoritative and is intended to contain the `apoio` A record itself, the simpler arrangement is to keep DNS in the parent zone and disable the redundant local subdomain zone.

Validate before changing anything:

```bash
dig +short NS etijucas.com.br
dig +short NS apoio.etijucas.com.br
dig +short A apoio.etijucas.com.br
dig +trace apoio.etijucas.com.br
```

Expected web target after DNS is correct:

```text
apoio.etijucas.com.br -> 186.209.113.134
```

Do not change NS records based only on the Plesk warning. Confirm the actual public delegation first.

## TLS gate

Before production:

```bash
curl -sSIL https://apoio.etijucas.com.br/
openssl s_client -connect apoio.etijucas.com.br:443 -servername apoio.etijucas.com.br </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName
```

Verify:
- certificate SAN includes `apoio.etijucas.com.br`;
- certificate is not expired;
- HTTP redirects to HTTPS;
- final response is 200;
- no redirect loop.

## Static artifact gates

The deployment artifact must contain at least:

```text
index.html
health.json
_next/
templates/
```

and must not contain:

```text
.env
.git/
node_modules/
src/
private keys
access tokens
```

## Runtime note

Node 20 available in Plesk remains useful for SSH diagnostics or a fallback build, and satisfies current Next.js minimum Node requirements. It is **not** required to serve the production public editor under this static model.

If future features require authenticated admin APIs, CRM or database writes, treat that as a separate backend architecture decision instead of silently converting this static public site into a Passenger-hosted Next.js server.
