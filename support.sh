#!/usr/bin/env bash
# Installs what the PlantUML rendering tests need:
#   - Java and Graphviz (only when missing),
#   - ./plantuml.jar and ./Archimate.puml at pinned versions.
#
# Both downloads are checked against pinned SHA-256 checksums, and a file
# that is already present with the right checksum is not downloaded again
# (CI restores them from a cache). To upgrade, change a version and its
# checksum together:
#   - PlantUML: the digest GitHub shows for plantuml-<version>.jar on
#     https://github.com/plantuml/plantuml/releases
#   - Archimate-PlantUML: sha256sum of Archimate.puml at the release commit.
set -euo pipefail

PLANTUML_VERSION="1.2026.8"
PLANTUML_SHA256="5e1ecfa8ecd32c90b03bbf3b1eb6f020943f98ab0fcf4032be31a0002ee2c462"

# v3.2.2, by commit so the content cannot change under the tag.
ARCHIMATE_COMMIT="52a6cdde1574664dee8bb1c137d75d50ee5d834f"
ARCHIMATE_SHA256="e873ecbfd8ea3ffaa9a28a5cd6185eb3df17d71bc69ab7ff78a154b5121fc38c"

cd "$(dirname "$0")"

# Downloads $url to $file unless $file already has checksum $sha256.
fetch_verified() {
  local url="$1" file="$2" sha256="$3"
  if [ -f "$file" ] && echo "${sha256}  ${file}" | sha256sum --check --status; then
    echo "ok      ${file} (already present, checksum verified)"
    return
  fi
  local tmp
  tmp="$(mktemp "${file}.XXXXXX")"
  curl --fail --location --silent --show-error "$url" --output "$tmp"
  if ! echo "${sha256}  ${tmp}" | sha256sum --check --status; then
    echo "error   ${file}: checksum mismatch for ${url}" >&2
    echo "        expected ${sha256}, got $(sha256sum "$tmp" | cut -d' ' -f1)" >&2
    rm -f "$tmp"
    exit 1
  fi
  mv "$tmp" "$file"
  echo "ok      ${file} (downloaded, checksum verified)"
}

missing=()
command -v java >/dev/null 2>&1 || missing+=(default-jre-headless)
command -v dot >/dev/null 2>&1 || missing+=(graphviz)
if [ "${#missing[@]}" -gt 0 ]; then
  echo "Installing ${missing[*]}"
  sudo apt-get -q -y update
  sudo apt-get -q -y install --no-install-recommends "${missing[@]}"
fi

fetch_verified \
  "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-${PLANTUML_VERSION}.jar" \
  plantuml.jar "$PLANTUML_SHA256"

fetch_verified \
  "https://raw.githubusercontent.com/plantuml-stdlib/Archimate-PlantUML/${ARCHIMATE_COMMIT}/dist/plantuml-stdlib/stdlib/archimate/Archimate.puml" \
  Archimate.puml "$ARCHIMATE_SHA256"
