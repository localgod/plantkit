#!/usr/bin/env bash

set -euo pipefail

java -jar plantuml.jar -pipe -tpng < tests/fixtures/plantuml-smoke.puml > /dev/null
