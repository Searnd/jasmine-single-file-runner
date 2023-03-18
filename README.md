# Jasmine/Karma Specific File Runner README ![](https://github.com/Searnd/jasmine-single-file-runner/actions/workflows/main.yml/badge.svg)

Or JSFR for short. This extension significantly reduces the amount of time spent waiting for your Angular tests to compile and run in cases where you only want to test a specific set of files.

Below is a comparison between executing a single test file in a moderate-sized project using **JSFR** (top) and using **fdescribe** (bottom):

<img src="assets/docs/demo.gif" width="481px">

## Features

Execute tests in a `.spec.ts` file by simply right-clicking on it and selecting the option `JSFR: Test current file`:

<img src="assets/docs/te-right-click.gif" width="481px">

Also possible through the file explorer:

<img src="assets/docs/fe-right-click.gif" width="481px">

To all the tests from a given directory, simply right-click on the corresponding folder instead of a single file.

## Requirements

Must have VS Code version 1.76.0 or higher.

Must have VS Code open in an angular project (contains an `angular.json` file).

Must have the angular cli installed globally (`npm i -g @angular/cli`).

## How does it work?
The default configuration for testing with Angular/Karma has the compiler searching recursively for all `.spec.ts` files in the project. This is done both
in the `test.ts` file and the `tsconfig.spec.json` file. Because of this, we're forced to spend the same amount of time compiling every single test whether we wamt to run the whole suite or just a few tests.
To solve this problem, JSFR modifies the `test.ts` and `tsconfig.spec.json` files so that we're only pointing to a given set of files—those that we actually want
to test. These changes are reverted as soon as the testing has ended via terminated the task or closing VS Code.

## Limitations
Changes made to the `test.ts` and `tsconfig.spec.json` files while JSFR is running won't be kept, as they are reverted to its initial state before starting JSFR.

---
## Releases

See the [changelog](CHANGELOG.md).
