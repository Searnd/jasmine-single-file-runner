# Change Log

### [Unreleased]

### [0.4.0]
- Remove `.ts` files from inclusion list in `tsconfig.spec.json`
- Version bump to reflect addition of the Test Explorer functionality
### [0.3.7]
- Clean up backslashes in `tsconfig.spec.ts`
- Remove some unecessary files
### [0.3.6]
- Add `.d.ts` files from `src` instead of `node_modules` to the inclusion list in `tsconfig.spec.json`
### [0.3.5]
- Add `.d.ts` files from `node_modules` to the inclusion list in `tsconfig.spec.json`
### [0.3.4]
- Update readme
- Add automatic release
### [0.3.3]
- Fix error with esbuild causing the extension to not work at all
### [0.3.2]
- Add CI
### [0.3.1]
- Fix bug causing spec files not to be loaded when either tscongig.spec.json or the test.ts file is in a different directory than expected
### [0.3.0]
- Add ability to run all tests in a folder by right-clicking it in the file explorer
### [0.2.7]
- Adjust gif sizes in readme
### [0.2.6]
- **Significant execution speed increase**: .spec file detection is no longer recursive in angular.json
- Add demo to readme
### [0.2.5]
- Fix context line not being properly updated
- Move release info to CHANGELOG.md
### [0.2.4]
- 'Preparing' message has progress bar
- Refactoring
### [0.2.3]
- Add gifs to README
- Fix async issues with executing tests
### [0.2.2]
- Update README, add license
### [0.2.1]
- Fix bug causing app.component.spec.ts to not be properly added to the context path
### [0.2.0]
- Spec file detection is no longer recursive
### [0.1.1]
- Fix bug where no spec files were being detected
### [0.1.0]
- Initial release of JSFR.
