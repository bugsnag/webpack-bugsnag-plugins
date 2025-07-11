# Changelog

## [2.2.3] - 2025-07-08

### Fixed

- Resolve issue where build metadata option was not properly handled when undefined (#101)

## [2.2.2] - 2025-07-03

- Ensure that we correctly pass the metadata the BugSnag CLI create build command (#100)

## [2.2.1] - 2025-05-27

- Ensure we expose all options in the Webpack plugin that are available in the Bugsnag CLI (#99)
- Allow BugsnagBuildReporterPlugin to pass all options in a single object (#99)

## [2.2.0] - 2025-05-13

- Ensure webpack plugin callback is called when running the source map upload and create build plugins (#95)

## [2.1.0] - 2025-05-12

- Ensure that we pass overwrite and endpoint to the BugSnag CLI (#93)

## [2.0.0] - 2025-04-28

There are no breaking changes in this release, but it has been marked as a major change due to the significant difference in the underlying tooling. Both source map upload and registering new builds is now done via the `@bugsnag/cli` package.

- Migrate `@bugsnag/source-maps` to `@bugsnag/cli` (#91)
- Migrate `@bugsnag/build-reporter` to `@bugsnag/cli` (#91)

## [1.9.0] - 2025-02-24

- handle parent directory references in source paths (#85)

## [1.8.0] - 2021-07-07

- Use webpack for logging (#55)
- Upgrade build reporter to latest version (#57)

## [1.7.0] - 2021-05-18

- Update to v2 of @bugsnag/source-maps (#53)

## [1.6.0] - 2020-12-17

- Add support for Webpack 5 (credit @chadrien) (#49)

## [1.5.0] - 2020-12-10

- Upgrade to new @bugsnag/source-maps library (#48)

## [1.4.5] - 2020-01-28

- Allow setting of `codeBundleId` on `BugsnagSourceMapUploaderPlugin` (#40, fixes #38)

## [1.4.2] - 2019-09-10

### Changed

- Allow `publicPath` to be an empty string (supports targeting Node and using the top level project directory for the output) (#39)

## [1.4.1] - 2019-08-12

### Fixed

- Manually join paths rather than using `url.resolve()` as that doesn't work with the (\*) wildcard character (#37, fixes #35)

## [1.4.0] - 2019-03-13

### Changed

- Switch to manually calculating full paths on disk, preparing for the removal of `existsAt` in Webpack v5. This fixes a bug when `output.futureEmitAssets` is enabled in Webpack v4.29 (#29, fixes #28)

## [1.3.0] - 2019-01-21

### Added

- Add a list of ignored bundle exceptions (defaults to `[ '.css' ]`, preventing CSS bundles and source maps from unnecessarily being uploaded) (#26, fixes #24)

### Changed

- Improve bundle source file lookup (when bundles are output to a different directory than their source maps) (#27, fixes #20)

## [1.2.4] - 2018-12-14

### Fixed

- Handle missing asset when source map is not written to disk (#23, fixes #18)

## [1.2.3] - 2018-12-04

### Added

- Retry on failed requests (via dependency bump) (#21)

## [1.2.2] - 2018-06-27

### Added

- Support multiple maps per chunk (#14)

## [1.2.1] - 2018-06-25

### Fixed

- Tolerate leading slashes in chunk names (supports use with laravel-mix) (#12)

## [1.2.0] - 2018-06-15

This version uses feature detection to decide which Webpack APIs to use, making this change backwards compatible with Webpack v3.

## [1.1.1] - 2018-03-15

### Fixed

- fix(source-map-uploader): Only find corresponding source if a map file was found (#4)

## [1.1.0] - 2018-02-21

### Added

- Added `BugsnagSourceMapUploaderPlugin` (#1)

## [1.0.0] - 2018-01-15

Initial release 🚀
