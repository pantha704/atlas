#!/usr/bin/env bash
# Smoke-test every Atlas API trigger + dashboard UI hooks.
# Usage: ./scripts/verify-triggers.sh [base_url]
set -euo pipefail

BASE="${1:-https://atlas-nine-ashy.vercel.app}"
API="${BASE%/}/api"
PASS=0
FAIL=0

ok() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
bad() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }

check_json() {
  local name="$1" method="$2" path="$3" expect_code="$4"
  shift 4
  local body_file
  body_file=$(mktemp)
  local code
  code=$(curl -sS -m 45 -o "$body_file" -w "%{http_code}" -X "$method" "${API}${path}" \
    -H "Origin: ${BASE}" \
    -H "Referer: ${BASE}/dashboard" \
    -H "Accept: application/json" \
    "$@" 2>/dev/null || echo "000")
  local body
  body=$(head -c 200 "$body_file" 2>/dev/null || true)
  rm -f "$body_file"
  if [[ "$code" == "$expect_code" ]]; then
    ok "$name → HTTP $code"
  else
    bad "$name → HTTP $code (want $expect_code) body=${body:0:120}"
  fi
}

echo "=== Atlas trigger smoke test @ $BASE ==="
echo

echo "[public API]"
check_json "health" GET "/health" "200"
check_json "public digest" GET "/digest" "200"
check_json "demo digest" GET "/demo/digest" "200"

echo
echo "[pipeline triggers]"
# Light pipeline (dashboard "Run global pipeline")
check_json "POST /trigger (light)" POST "/trigger" "200" \
  -H "Content-Type: application/json" -d '{}'
check_json "GET /trigger (light)" GET "/trigger" "200"
# Cron default is light now
check_json "GET /cron/fetch (light)" GET "/cron/fetch" "200"

echo
echo "[auth gates — unauthenticated]"
check_json "auth/me (anon)" GET "/auth/me" "200"
check_json "sources list" GET "/sources" "401"
check_json "my-digest peek" GET "/my-digest?peek=1" "401"
check_json "my-digest generate" GET "/my-digest?fast=1&limit=5" "401"
check_json "profile" GET "/profile" "401"
check_json "POST sources" POST "/sources" "401" \
  -H "Content-Type: application/json" -d '{"type":"rss","config":{"url":"https://x.com/f"}}'
check_json "PATCH source" PATCH "/sources/x" "401" \
  -H "Content-Type: application/json" -d '{"enabled":false}'
check_json "DELETE source" DELETE "/sources/x" "401"

echo
echo "[dashboard UI markup]"
DASH=$(mktemp)
curl -sS -m 20 -o "$DASH" "${BASE}/dashboard" || true
for id in myDigestBtn fetchMoreBtn forceDigestBtn triggerBtn digest-article triggerStatus; do
  if rg -q "id=\"$id\"|id='$id'" "$DASH" 2>/dev/null; then
    ok "dashboard has #$id"
  else
    bad "dashboard missing #$id"
  fi
done
for action in generate fetch-more force-rescore global-pipeline; do
  if rg -q "data-action=\"$action\"" "$DASH" 2>/dev/null; then
    ok "dashboard data-action=$action"
  else
    bad "dashboard missing data-action=$action"
  fi
done
if rg -q "loadMyDigest|apiUrl|/trigger|/my-digest" "$DASH" 2>/dev/null; then
  ok "dashboard client handlers present"
else
  bad "dashboard client handlers missing"
fi
rm -f "$DASH"

echo
echo "[sources UI markup]"
SRC=$(mktemp)
curl -sS -m 20 -o "$SRC" "${BASE}/sources" || true
for id in add-source-btn add-type sources-list; do
  if rg -q "id=\"$id\"" "$SRC" 2>/dev/null; then
    ok "sources has #$id"
  else
    bad "sources missing #$id"
  fi
done
rm -f "$SRC"

echo
echo "=== Results: $PASS passed, $FAIL failed ==="
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
