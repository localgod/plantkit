 #!/usr/bin/env bash
echo "Install global npm modules"
npm install --location=global npm@latest typescript@latest markdownlint-cli@latest

basepath=https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/

urls=(
    "${basepath}C4_Component.puml"
    "${basepath}C4_Container.puml"
    "${basepath}C4_Context.puml"
    "${basepath}C4.puml"
)
echo "Install C4 macros"
for url in "${urls[@]}"; do
    filename=$(basename "$url")
    if [ ! -f "$filename" ]; then
        wget -q "$url"
    fi
done

echo "Install Archimate macros"
curl -L -s -k https://raw.githubusercontent.com/ebbypeter/Archimate-PlantUML/master/Archimate.puml --output Archimate.puml

