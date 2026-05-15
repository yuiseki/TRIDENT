
all: \
	fetch_reliefweb \
	update_reliefweb \
	voyager

.PHONY: setup
setup: setup_llama_cpp

.PHONY: setup_llama_cpp
setup_llama_cpp:
	./scripts/llama.cpp/start-trident-all-mac.sh

.PHONY: stop_llama_cpp
stop_llama_cpp:
	tmux ls 2>/dev/null | awk -F: '/^trident-/{print $$1}' | xargs -I{} tmux kill-session -t {}

.PHONY: setup_ollama
setup_ollama:
	curl -fsSL https://ollama.com/install.sh | sh
	ollama pull qwen3:8b
	ollama pull snowflake-arctic-embed:22m

.PHONY: fetch_nhk
fetch_nhk:
	npm run site:www3.nhk.or.jp:fetch

.PHONY: fetch_reliefweb
fetch_reliefweb:
	npm run site:api.reliefweb.int:fetch

.PHONY: update_reliefweb
update_reliefweb:
	npm run site:api.reliefweb.int:update

.PHONY: voyager
voyager:
	npm run voyager

.PHONY: analyze_disasters
analyze_disasters:
	npm run site:api.reliefweb.int:analyze_disasters
