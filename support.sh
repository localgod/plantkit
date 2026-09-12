#!/usr/bin/env bash

# Install library dependencies
sudo apt-get -q -y update
sudo apt-get -q -y install default-jre-headless graphviz

# Install plantuml library
VERSION="1.2026.8"
echo "Install PlantUML"
curl --fail --location --silent --show-error "https://github.com/plantuml/plantuml/releases/download/v${VERSION}/plantuml-${VERSION}.jar" --output plantuml.jar

echo "Install Archimate macros"
ARCHIMATE_VERSION="3.2.2"
curl --fail --location --silent --show-error "https://raw.githubusercontent.com/plantuml-stdlib/Archimate-PlantUML/v${ARCHIMATE_VERSION}/dist/plantuml-stdlib/stdlib/archimate/Archimate.puml" --output Archimate.puml

