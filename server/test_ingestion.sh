#!/usr/bin/env bash
# Send fake telemetry batches to the ingestion server.
#
#   ./send_telemetry.sh                          # 3 resources x 5 batches x 10 samples
#   RESOURCES=10 BATCHES=50 ./send_telemetry.sh  # heavier run
#   SPIKE=1 ./send_telemetry.sh                  # res_1 runs at 95-99% CPU (tests the spike checker)
#
# CPU values imitate /proc/stat: per-core counters (in jiffies, 100 per second)
# that only ever increase. Busy % comes from the difference between two samples.
# Memory values imitate /proc/meminfo, in kB.
#
# Every setting can be overridden with an environment variable.
set -euo pipefail

URL="${URL:-http://localhost:8001/v1/ingestion/record}"
TENANT="${TENANT:-tenant_42}"
RESOURCES="${RESOURCES:-3}"     # distinct resource_ids
BATCHES="${BATCHES:-5}"         # requests per resource
SAMPLES="${SAMPLES:-10}"        # samples per request
CORES="${CORES:-4}"             # CPU cores per sample
STEP="${STEP:-10}"              # seconds between samples
SPIKE="${SPIKE:-0}"             # 1 = res_1 runs hot
MEM_TOTAL_KB="${MEM_TOTAL_KB:-16384000}"   # ~16 GB
SWAP_TOTAL_KB="${SWAP_TOTAL_KB:-4096000}"  # ~4 GB

HZ=100                          # jiffies per second (USER_HZ on Linux)
FIELDS=(user usernice system idle iowait irq softirq steal guest guestnice)

# Cumulative counters, one per resource x core x field. They must persist
# across samples and batches, so make_sample writes to a global variable
# instead of being called inside $(...), which would run it in a subshell
# and throw the updates away.
declare -A CTR
SAMPLE_JSON=""

# Start the counters like a machine that's been up a few hours at ~25% load.
init_counters() {
    local r=$1 c up
    for (( c = 0; c < CORES; c++ )); do
        up=$(( 1000000 + RANDOM * 100 ))      # jiffies since boot, per core
        CTR[$r,$c,user]=$((     up * 17 / 100 ))
        CTR[$r,$c,usernice]=$(( up / 100 ))
        CTR[$r,$c,system]=$((   up * 5 / 100 ))
        CTR[$r,$c,iowait]=$((   up * 2 / 100 ))
        CTR[$r,$c,irq]=$((      up / 200 ))
        CTR[$r,$c,softirq]=$((  up / 100 ))
        CTR[$r,$c,idle]=$((     up - ${CTR[$r,$c,user]} - ${CTR[$r,$c,usernice]} - ${CTR[$r,$c,system]} \
                                   - ${CTR[$r,$c,iowait]} - ${CTR[$r,$c,irq]} - ${CTR[$r,$c,softirq]} ))
        CTR[$r,$c,steal]=0; CTR[$r,$c,guest]=0; CTR[$r,$c,guestnice]=0
    done
}

# Build one sample into SAMPLE_JSON. Args: unix_ts resource_number
make_sample() {
    local ts=$1 r=$2 c f busy_pct total busy iowait cores=""
    total=$(( STEP * HZ ))                      # jiffies per core in one interval

    for (( c = 0; c < CORES; c++ )); do
        if [[ $SPIKE == 1 && $r == 1 ]]; then
            busy_pct=$(( 95 + RANDOM % 5 ))     # 95..99 %
        else
            busy_pct=$(( 5 + RANDOM % 56 ))     # 5..60 %
        fi
        busy=$(( total * busy_pct / 100 ))
        iowait=$(( total * (RANDOM % 4) / 100 ))      # 0..3 %
        (( iowait > total - busy )) && iowait=$(( total - busy ))

        # Split busy time roughly the way a real machine does. softirq takes
        # the remainder, so the parts add up to exactly `busy` and the busy %
        # a consumer computes isn't shaved by integer rounding.
        local u=$(( busy * 70 / 100 )) un=$(( busy * 2 / 100 ))
        local sy=$(( busy * 22 / 100 )) iq=$(( busy * 2 / 100 ))
        CTR[$r,$c,user]=$((      ${CTR[$r,$c,user]}      + u ))
        CTR[$r,$c,usernice]=$((  ${CTR[$r,$c,usernice]}  + un ))
        CTR[$r,$c,system]=$((    ${CTR[$r,$c,system]}    + sy ))
        CTR[$r,$c,irq]=$((       ${CTR[$r,$c,irq]}       + iq ))
        CTR[$r,$c,softirq]=$((   ${CTR[$r,$c,softirq]}   + busy - u - un - sy - iq ))
        CTR[$r,$c,iowait]=$((    ${CTR[$r,$c,iowait]}    + iowait ))
        CTR[$r,$c,idle]=$((      ${CTR[$r,$c,idle]}      + total - busy - iowait ))
        # steal, guest and guestnice stay unchanged (no virtualisation here)

        local core="{" sep=""
        for f in "${FIELDS[@]}"; do
            core+="${sep}\"$f\":${CTR[$r,$c,$f]}"; sep=","
        done
        cores+="${cores:+,}$core}"
    done

    local avail=$(( MEM_TOTAL_KB * (20 + RANDOM % 61) / 100 ))      # 20..80 % free
    local used=$(( MEM_TOTAL_KB - avail ))
    local swapfree=$(( SWAP_TOTAL_KB * (70 + RANDOM % 31) / 100 ))  # 70..100 % free
    local swapused=$(( SWAP_TOTAL_KB - swapfree ))

    printf -v SAMPLE_JSON \
        '{"timestamp":%d,"cpustat":{"cores":[%s],"totalcores":%d},"memstat":{"memtotal":%d,"memavail":%d,"memused":%d,"usedpercent":%d,"swaptotal":%d,"swapfree":%d,"swapused":%d,"swapusedpercent":%d}}' \
        "$ts" "$cores" "$CORES" \
        "$MEM_TOTAL_KB" "$avail" "$used" $(( used * 100 / MEM_TOTAL_KB )) \
        "$SWAP_TOTAL_KB" "$swapfree" "$swapused" $(( swapused * 100 / SWAP_TOTAL_KB ))
}

ok=0; failed=0; sent=0
start_ts=$(( $(date +%s) - BATCHES * SAMPLES * STEP ))   # end the series at roughly "now"
body_file=$(mktemp)
trap 'rm -f "$body_file"' EXIT

for (( r = 1; r <= RESOURCES; r++ )); do
    init_counters "$r"
done

echo "POST $URL  (resources=$RESOURCES batches=$BATCHES samples=$SAMPLES cores=$CORES spike=$SPIKE)"

for (( b = 0; b < BATCHES; b++ )); do
    for (( r = 1; r <= RESOURCES; r++ )); do
        samples=""
        for (( s = 0; s < SAMPLES; s++ )); do
            make_sample $(( start_ts + (b * SAMPLES + s) * STEP )) "$r"
            samples+="${samples:+,}$SAMPLE_JSON"
        done
        payload=$(printf '{"resource_id":"res_%d","tenant_id":"%s","samples":[%s],"timestamp":%d}' \
                         "$r" "$TENANT" "$samples" "$(date +%s)")

        # -w prints the status code; a connection failure gives 000 instead of exiting.
        code=$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 10 \
                    -H 'Content-Type: application/json' --data "$payload" "$URL" 2>/dev/null) || code=000

        if [[ $code == 2* ]]; then
            ok=$(( ok + 1 )); sent=$(( sent + SAMPLES ))
            printf '  [%3s] res_%d batch %d  %s\n' "$code" "$r" "$b" "$(cat "$body_file")"
        else
            failed=$(( failed + 1 ))
            printf '  [%3s] res_%d batch %d  FAILED: %s\n' "$code" "$r" "$b" "$(head -c 300 "$body_file")"
        fi
    done
done

echo "Done: $ok ok, $failed failed, $sent samples accepted"
(( failed == 0 ))   # non-zero exit if anything failed
