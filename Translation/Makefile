SHELL=/bin/bash -O extglob

main: build run		## Build and start demo model (default)

build:
	@absc -erlang -http-index-file ./web/index.html -http-static-dir ./web/ Main.abs !(@(Main|Test)*).abs

run:
	@gen/erl/run -p 8080


help:				## Display this message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
