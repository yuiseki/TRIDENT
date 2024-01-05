
all: \
	fetch_nhk \
	fetch_reliefweb \
	analyze_disasters

.PHONY: fetch_nhk
fetch_nhk:
	npm run site:www3.nhk.or.jp:fetch

.PHONY: fetch_reliefweb
fetch_reliefweb:
	npm run site:api.reliefweb.int:fetch

.PHONY: analyze_disasters
analyze_disasters:
	npm run site:api.reliefweb.int:analyze_disasters

docker-build:
	docker image inspect local/llama.cpp:full > /dev/null || docker build -t local/llama.cpp:full -f ~/llama.cpp/.devops/full.Dockerfile ~/llama.cpp
	docker image inspect local/llama.cpp:full-cuda > /dev/null || docker build -t local/llama.cpp:full-cuda -f ~/llama.cpp/.devops/full-cuda.Dockerfile ~/llama.cpp
