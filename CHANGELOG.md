# Changelog

## 1.4.5 (2020-01-28)

- Allow setting of `codeBundleId` on `BugsnagSourceMapUploaderPlugin` (#40, fixes #38)

## 1.4.2 (2019-09-10)

### Changed
- Allow `publicPath` to be an empty string (supports targeting Node and using the top level project directory for the output) (#39)

## 1.4.1 (2019-08-12)

### Fixed
- Manually join paths rather than using `url.resolve()` as that doesn't work with the (\*) wildcard character (#37, fixes #35)

## 1.4.0 (2019-03-13)

### Changed
- Switch to manually calculating full paths on disk, preparing for the removal of `existsAt` in Webpack v5. This fixes a bug when `output.futureEmitAssets` is enabled in Webpack v4.29 (#29, fixes #28)

## 1.3.0 (2019-01-21)

### Added
- Add a list of ignored bundle exceptions (defaults to `[ '.css' ]`, preventing CSS bundles and source maps from unnecessarily being uploaded) (#26, fixes #24)

### Changed
- Improve bundle source file lookup (when bundles are output to a different directory than their source maps) (#27, fixes #20)

## 1.2.4 (2018-12-14)

### Fixed
- Handle missing asset when source map is not written to disk (#23, fixes #18)

## 1.2.3 (2018-12-04)

### Added
- Retry on failed requests (via dependency bump) (#21)

## 1.2.2 (2018-06-27)

### Added
- Support multiple maps per chunk (#14)

## 1.2.1 (2018-06-25)

### Fixed
- Tolerate leading slashes in chunk names (supports use with laravel-mix) (#12)

## 1.2.0 (2018-06-15)

This version uses feature detection to decide which Webpack APIs to use, making this change backwards compatible with Webpack v3.

## 1.1.1 (2018-03-15)

### Fixed
- fix(source-map-uploader): Only find corresponding source if a map file was found (#4)

## 1.1.0 (2018-02-21)

### Added
- Added `BugsnagSourceMapUploaderPlugin` (#1)

## 1.0.0 (2018-01-15)

Initial release 🚀
