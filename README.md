# template ts browser
![tests](https://github.com/nichoth/template-ts-browser/actions/workflows/nodejs.yml/badge.svg)
[![types](https://img.shields.io/npm/types/@nichoth/**placeholder**)](README.md)
[![module](https://img.shields.io/badge/module-ESM-blue)](README.md)
[![license](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE)

A template for typescript *dependency* modules that run in a browser environment. Uses `tape-run` for tests in a browser. See [template-ts](https://github.com/nichoth/template-ts) for the same thing but targeting Node.

## use
1. Use the template button in github. Or clone this then `rm -rf .git && git init`. Then `npm i && npm init`.

2. Edit the source code in `src/index.ts`.

## featuring

* compile the source to both ESM and CJS format, and put compiled files in `dist`.
* ignore `dist` and `*.js` in git, but don't ignore them in npm. That way we don't commit any compiled code to git, but it is available to consumers.
* use npm's `prepublishOnly` hook to compile the code before publishing to npm.
* use `exports` field in `package.json` to make sure the right format is used by consumers.
* `preversion` npm hook -- lint via `standardx`.
* `postversion` npm hook -- `git push && git push --tags && npm publish`
* eslint via [standardx](https://www.npmjs.com/package/standardx) -- `npm run lint`
* tests run in a browser environment via `tape-run` -- see `npm test`. Includes `tap` testing tools -- [tapzero](https://github.com/nichoth/tapzero) and [tap-arc](https://www.npmjs.com/package/tap-arc)
* CI via github actions
