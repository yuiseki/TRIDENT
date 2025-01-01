
all: \
	fetch_reliefweb \
	update_reliefweb \
	voyager

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
