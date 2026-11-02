#!/usr/bin/env bash
# Renders the hand-written fixture and the diagrams generated through
# plantkit's public API (scripts/generate-smoke.mts) with PlantUML.
# Fails on the first syntax error. Needs a built ./dist (npm run build)
# and ./plantuml.jar (./support.sh).
set -euo pipefail

out_dir="out/smoke"
rm -rf "$out_dir"
node scripts/generate-smoke.mts "$out_dir"
# With -pipe, includes resolve from the repository root (the fixture uses
# the Archimate.puml that support.sh downloads there).
cp tests/fixtures/plantuml-smoke.puml "$out_dir/"

status=0
for file in "$out_dir"/*.puml; do
  if java -Djava.awt.headless=true -jar plantuml.jar -tsvg -failfast2 -pipe < "$file" > "${file%.puml}.svg" 2> "${file%.puml}.err"; then
    echo "ok      $file"
  else
    echo "FAILED  $file"
    cat "${file%.puml}.err"
    status=1
  fi
done
exit "$status"
