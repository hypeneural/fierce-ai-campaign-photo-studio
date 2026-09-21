#!/usr/bin/env bash
set -u

printf '== identity ==\n'
pwd
id

printf '\n== operating system ==\n'
uname -a
cat /etc/os-release 2>/dev/null || true

printf '\n== tools ==\n'
git --version 2>/dev/null || true
command -v node || true
command -v npm || true
/opt/plesk/node/20/bin/node --version 2>/dev/null || true
/opt/plesk/node/20/bin/npm --version 2>/dev/null || true
/opt/plesk/node/22/bin/node --version 2>/dev/null || true
/opt/plesk/node/22/bin/npm --version 2>/dev/null || true

printf '\n== limits ==\n'
df -h . 2>/dev/null || true
ulimit -a 2>/dev/null || true

printf '\n== DNS (read only) ==\n'
for name in etijucas.com.br apoio.etijucas.com.br; do
  printf -- '-- %s --\n' "$name"
  dig +short NS "$name" 2>/dev/null || true
  dig +short A "$name" 2>/dev/null || true
done

printf '\n== HTTP/TLS (read only) ==\n'
curl -sSIL --max-time 15 http://apoio.etijucas.com.br/ 2>/dev/null || true
curl -sSIL --max-time 15 https://apoio.etijucas.com.br/ 2>/dev/null || true

printf '\nNo changes were made by this script.\n'
