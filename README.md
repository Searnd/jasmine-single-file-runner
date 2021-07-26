# Jasmine/Karma Single File Runner README ![](https://github.com/Searnd/jasmine-single-file-runner/actions/workflows/main.yml/badge.svg)

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

## How does it work?
The default configuration for testing with Angular/Karma has the compiler searching recursively for all `.spec.ts` files in the project. This is done both
in the `test.ts` file and the `tsconfig.spec.json` file. As such, in cases where we simply want to run tests in a few files, we're spending a lot of unecessary time and resources looking for and compiling all these other tests.
To solve this problem, JSFR modifies the `test.ts` and `tsconfig.spec.json` files so that we're only pointing to a given set of files—those that we actually want
to test. These changes are reverted as soon as the testing has ended via terminated the task or closing VS Code.

## Limitations
To ensure that specs are properly discovered and displayed in the test explorer, `describe` and `it` statements must have their labels defined inline using a string literal, or by a variable whose last assignment is a string literal.

e.g.

### Works:

```typescript
describe("AppComponent", () => {});
```

```typescript
const label = "AppComponent";
describe(label, () => {});
```
### Doesn't work:
```typescript
let doMagic = "do magic";
const label = "should" + doMagic;
it(label, () => {});
```

Furthermore, the callback function can only be defined inline.

e.g.

### Works
```typescript
describe("", () => {
    // do stuff
});
```

```typescript
describe("", function () {
    // do stuff
});
```

### Doesn't work
```typescript
const doStuff = () {
    // do stuff
}
describe("", doStuff);
```
```typescript
function doStuff() {
    // do stuff
}
describe("", doStuff);
```
## Known Issues

Changes made to the `test.ts` file while JSFR is running won't be kept, as `test.ts` is reverted to its initial state before starting JSFR.

---

## Releases

See the [changelog](CHANGELOG.md).
