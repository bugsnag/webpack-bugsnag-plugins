# Changelog

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
