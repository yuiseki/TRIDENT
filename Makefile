
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