#!/usr/bin/env bash
set -euo pipefail
# Start all 4 TRIDENT llama-server instances on Mac
HERE="$(cd "$(dirname "$0")" && pwd)"
"${HERE}/start-trident-inner-mac.sh"
"${HERE}/start-trident-surface-mac.sh"
"${HERE}/start-trident-deep-mac.sh"
"${HERE}/start-trident-embedding-mac.sh"
echo
echo "all sessions:"
tmux ls 2>/dev/null | grep '^trident-' || true
echo
echo "stop all:  tmux ls | awk -F: '/^trident-/{print \$1}' | xargs -I{} tmux kill-session -t {}"
