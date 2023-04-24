# list available jobs
default:
  just --list

# runs `hugo serve` locally
serve:
  hugo serve --watch --buildDrafts --source src

# makes the package pages
package-pages:
  .github/build-package-pages.sh src/data/packages.json src/content

# builds the site for ci
ci:
  -test -d node_modules && rm -rf node_modules
  npm ci
  npx --no-install babel --no-babelrc -f src/scripts/bottles.jsx --out-file=/tmp/compileOut-1419075422.js
  npx --no-install babel --no-babelrc -f src/scripts/package-bottles.jsx --out-file=/tmp/compileOut-2181051641.js
  hugo --source src --destination ../public --minify

# builds the site
build:
  npm i
  hugo --source src --destination ../public --minify

# cleans up build artifacts
clean:
  rm -rf public
