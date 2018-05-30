SHELL=/bin/bash -O extglob

JSFILES=static/highcharts.js static/highcharts-data.js static/jquery-3.2.1.js static/fraction.js static/index.css

main: build run		## Build and start demo model (default)

build:				## Build the model
	@absc -erlang Main.abs !(@(Main|Test)*).abs

run:				## Start the model
	@cp static/index2.html gen/erl/absmodel/priv/index.html
	@cp $(JSFILES) gen/erl/absmodel/priv/static
	@gen/erl/run -p 8080

help:				## Display this message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
