#!/usr/bin/env bash
set -euo pipefail
# TRIDENT deep layer (Overpass QL generation): custom fine-tuned 0.5B on port 18093

SESSION_NAME="${SESSION_NAME:-trident-deep}"
PORT="${PORT:-18093}"
HOST="${HOST:-127.0.0.1}"
LLAMA_CPP_DIR="${LLAMA_CPP_DIR:-/Users/yuiseki/src/github.com/geolonia/_20_percent_rule/ggml-org/llama.cpp}"
LLAMA_SERVER_BIN="${LLAMA_CPP_DIR}/build/bin/llama-server"
HF_REPO="${HF_REPO:-yuiseki/qwen2.5-coder-0.5b-trident-deep-v4.2-gguf}"
HF_QUANT="${HF_QUANT:-Q4_K_M}"
LOG_PATH="${LOG_PATH:-/tmp/${SESSION_NAME}.log}"

if ! command -v tmux >/dev/null 2>&1; then echo "tmux required" >&2; exit 1; fi
if [ ! -x "${LLAMA_SERVER_BIN}" ]; then echo "llama-server not found: ${LLAMA_SERVER_BIN}" >&2; exit 1; fi
if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  echo "session ${SESSION_NAME} already exists"; echo "log: ${LOG_PATH}"; exit 0
fi

# Deep layer model is 0.5B Qwen2.5-Coder fine-tune. Reports 100% accuracy on 112
# Overpass QL test pairs. Tiny enough that Metal offload trivially fits.
CMD=$(cat <<EOF
${LLAMA_SERVER_BIN} \
  -hf ${HF_REPO}:${HF_QUANT} \
  -a trident-deep \
  -ngl 999 \
  -c 8192 \
  -np 1 \
  -fa on \
  -ctk q8_0 \
  -ctv q8_0 \
  -t 10 \
  --reasoning off \
  --host ${HOST} \
  --port ${PORT} \
  > ${LOG_PATH} 2>&1
EOF
)

tmux new-session -d -s "${SESSION_NAME}" "bash -lc '${CMD}'"
echo "started: ${SESSION_NAME}  endpoint: http://${HOST}:${PORT}/v1"
echo "log: ${LOG_PATH}"
