 #!/usr/bin/env bash

# Install library dependencies
sudo apt-get -q -y update
sudo apt-get -q -y install graphviz

# Install plantuml library
VERSION="1.2025.3"
DIST="pdf"
echo "Install PlantUML"
curl -L -s -k https://github.com/plantuml/plantuml/releases/download/v${VERSION}/plantuml-${DIST}-${VERSION}.jar --output plantuml.jar

echo "Install Archimate macros"
curl -L -s -k https://raw.githubusercontent.com/ebbypeter/Archimate-PlantUML/master/Archimate.puml --output Archimate.puml

