# Jasmine/Karma Single File Runner README

Or JSFR for short. This extension gives you the ability to provide a single file for testing to the Angular test suite, significantly reducing test compilation time.

Below is a comparison between executing a single test file in a moderate-sized project using **JSFR** (top) and using **fdescribe** (bottom):
![demo](assets/docs/demo.gif)

## Features

Execute tests in a `.spec.ts` file by simply right-clicking on it and selecting the option `JSFR: Test Current File`:
![right-click-in-text-editor](assets/docs/te-right-click.gif)

Also possible through the file explorer:
![right-click-in-file-explorer](assets/docs/fe-right-click.gif)

## Requirements

Must have VS Code version 1.57.0 or higher.

Must have VS Code open in an angular project (contains an `angular.json` file).

## Known Issues

Changes made to the `test.ts` file while JSFR is running won't be kept, as `test.ts` is reverted to its initial state before starting JSFR.

---

## Releases

See the [changelog](CHANGELOG.md).