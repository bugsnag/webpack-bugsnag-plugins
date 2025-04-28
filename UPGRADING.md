# Upgrading Guide

## 1.x to 2.x

From v2 of the plugin, the BugSnag CLI is used to perform the build reporting and source map uploading rather than the [`bugsnag-build-reporter`](https://www.npmjs.com/package/bugsnag-build-reporter) and [`@bugsnag/source-maps`](https://www.npmjs.com/package/@bugsnag/source-maps) packages, respectively. The [CLI tool](https://github.com/bugsnag/bugsnag-cli), with its [npm wrapper](https://www.npmjs.com/package/@bugsnag/cli) is unifying our build tooling across our supported platforms, causing the separate build reporter and source map uploading packages to be deprecated in due course.

There are no breaking changes in the v2 release, but it has been marked as a major change due to the significant difference in the underlying tooling.