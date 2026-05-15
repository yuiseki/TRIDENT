#!/usr/bin/env bash
set -euo pipefail
# TRIDENT embedding service: nomic-embed-text-v1.5 on port 18094
# Replaces Ollama snowflake-arctic-embed:22m. Dimension 768 (vs Snowflake 384).
# pgvector tables must be (re)initialized at first boot.

SESSION_NAME="${SESSION_NAME:-trident-embedding}"
PORT="${PORT:-18094}"
HOST="${HOST:-127.0.0.1}"
LLAMA_CPP_DIR="${LLAMA_CPP_DIR:-/Users/yuiseki/src/github.com/geolonia/_20_percent_rule/ggml-org/llama.cpp}"
LLAMA_SERVER_BIN="${LLAMA_CPP_DIR}/build/bin/llama-server"
HF_REPO="${HF_REPO:-nomic-ai/nomic-embed-text-v1.5-GGUF}"
HF_QUANT="${HF_QUANT:-f16}"
LOG_PATH="${LOG_PATH:-/tmp/${SESSION_NAME}.log}"

if ! command -v tmux >/dev/null 2>&1; then echo "tmux required" >&2; exit 1; fi
if [ ! -x "${LLAMA_SERVER_BIN}" ]; then echo "llama-server not found: ${LLAMA_SERVER_BIN}" >&2; exit 1; fi
if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
  echo "session ${SESSION_NAME} already exists"; echo "log: ${LOG_PATH}"; exit 0
fi

# --embedding enables /v1/embeddings endpoint. --pooling mean is the default for
# nomic-embed-text. Disable flash attention for embeddings (not always supported).
CMD=$(cat <<EOF
${LLAMA_SERVER_BIN} \
  -hf ${HF_REPO}:${HF_QUANT} \
  -a trident-embedding \
  --embedding \
  --pooling mean \
  -ngl 999 \
  -c 8192 \
  -ub 8192 \
  -b 8192 \
  -t 10 \
  --host ${HOST} \
  --port ${PORT} \
  > ${LOG_PATH} 2>&1
EOF
)

tmux new-session -d -s "${SESSION_NAME}" "bash -lc '${CMD}'"
echo "started: ${SESSION_NAME}  endpoint: http://${HOST}:${PORT}/v1/embeddings"
echo "log: ${LOG_PATH}"
