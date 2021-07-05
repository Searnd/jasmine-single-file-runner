# Jasmine/Karma Single File Runner README

Or JSFR for short. This extension gives you the ability to provide a single file for testing to the Angular test suite, significantly reducing test compilation time.

Below is a comparison between executing a single test file in a moderate-sized project using **JSFR** (top) and using **fdescribe** (bottom):

<img src="assets/docs/demo.gif" width="481px">

## Features

Execute tests in a `.spec.ts` file by simply right-clicking on it and selecting the option `JSFR: Test Current File`:

<img src="assets/docs/te-right-click.gif" width="481px">

Also possible through the file explorer:

<img src="assets/docs/fe-right-click.gif" width="481px">

To all the tests from a given directory, simply right-click on the corresponding folder instead of a single file.

## Requirements

Must have VS Code version 1.57.0 or higher.

Must have VS Code open in an angular project (contains an `angular.json` file).

Must have the angular cli installed globally (`npm i -g @angular/cli`).

## Known Issues

Changes made to the `test.ts` file while JSFR is running won't be kept, as `test.ts` is reverted to its initial state before starting JSFR.

---

## Releases

See the [changelog](CHANGELOG.md).