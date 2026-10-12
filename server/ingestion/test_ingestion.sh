#!/usr/bin/env bash
# Send fake telemetry batches to the ingestion server.
#
#   ./send_telemetry.sh                      # 3 hosts x 5 batches x 10 samples
#   HOSTS=10 BATCHES=50 ./send_telemetry.sh  # heavier run
#   SPIKE=1 ./send_telemetry.sh              # host_1 sends CPU >= 95% (tests the spike checker)
#
# Every setting can be overridden with an environment variable.
set -euo pipefail

URL="${URL:-http://localhost:8001/v1/ingestion/record}"
TENANT="${TENANT:-tenant_42}"
HOSTS="${HOSTS:-3}"          # distinct host_ids
BATCHES="${BATCHES:-5}"      # requests per host
SAMPLES="${SAMPLES:-10}"     # samples per request
CORES="${CORES:-4}"          # CPU cores per sample
STEP="${STEP:-10}"           # seconds between samples
SPIKE="${SPIKE:-0}"          # 1 = host_1 runs hot

# Random number in tenths: 0..999 -> printed as 0.0..99.9
rand_tenths() { echo $(( RANDOM % 1000 )); }
fmt() { printf '%d.%d' $(( $1 / 10 )) $(( $1 % 10 )); }

# One sample as JSON. Args: unix_ts host_number
make_sample() {
    local ts=$1 host=$2 cores="" sum=0 burst
    for (( c = 0; c < CORES; c++ )); do
        if [[ $SPIKE == 1 && $host == 1 ]]; then
            burst=$(( 950 + RANDOM % 50 ))      # 95.0..99.9
        else
            burst=$(rand_tenths)
        fi
        sum=$(( sum + burst ))
        cores+="${cores:+,}{\"core\":\"cpu$c\",\"burst\":$(fmt $burst)}"
    done
    printf '{"timestamp":"%s","cpu":{"cores":[%s],"avg":%s},"disk":{"usage":%s}}' \
        "$(date -u -d "@$ts" +%Y-%m-%dT%H:%M:%SZ)" "$cores" \
        "$(fmt $(( sum / CORES )))" "$(fmt $(rand_tenths))"
}

ok=0; failed=0; sent=0
start_ts=$(( $(date +%s) - BATCHES * SAMPLES * STEP ))   # end the series at roughly "now"
body_file=$(mktemp)
trap 'rm -f "$body_file"' EXIT

echo "POST $URL  (hosts=$HOSTS batches=$BATCHES samples=$SAMPLES spike=$SPIKE)"

for (( b = 0; b < BATCHES; b++ )); do
    for (( h = 1; h <= HOSTS; h++ )); do
        samples=""
        for (( s = 0; s < SAMPLES; s++ )); do
            ts=$(( start_ts + (b * SAMPLES + s) * STEP ))
            samples+="${samples:+,}$(make_sample "$ts" "$h")"
        done
        payload=$(printf '{"host_id":"host_%d","tenant_id":"%s","samples":[%s]}' "$h" "$TENANT" "$samples")

        # -w prints the status code; a connection failure gives 000 instead of exiting.
        code=$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 10 \
                    -H 'Content-Type: application/json' --data "$payload" "$URL" 2>/dev/null) || code=000

        if [[ $code == 2* ]]; then
            ok=$(( ok + 1 )); sent=$(( sent + SAMPLES ))
            printf '  [%3s] host_%d batch %d  %s\n' "$code" "$h" "$b" "$(cat "$body_file")"
        else
            failed=$(( failed + 1 ))
            printf '  [%3s] host_%d batch %d  FAILED: %s\n' "$code" "$h" "$b" "$(head -c 300 "$body_file")"
        fi
    done
done

echo "Done: $ok ok, $failed failed, $sent samples accepted"
(( failed == 0 ))   # non-zero exit if anything failed
