
all: \
	fetch_reliefweb \
	update_reliefweb \
	voyager

.PHONY: setup
setup:
	test ollama || $(MAKE) setup_ollama
	ollama pull qwen2.5:1.5b
	ollama pull snowflake-arctic-embed:22m

.PHONY: setup_ollama
setup_ollama:
	curl -fsSL https://ollama.com/install.sh | sh

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
