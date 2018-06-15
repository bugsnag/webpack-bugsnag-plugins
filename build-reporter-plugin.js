'use strict'

const reportBuild = require('bugsnag-build-reporter')

class BugsnagBuildReporterPlugin {
  constructor (build, options) {
    this.build = Object.assign({ buildTool: 'webpack-bugsnag-plugins' }, build)
    this.options = Object.assign({ logLevel: 'warn' }, options)
  }

  apply (compiler) {
    const plugin = (compilation, cb) => {
      const stats = compilation.getStats()
      if (stats.hasErrors()) return cb(null)
      reportBuild(this.build, this.options)
        .then(() => cb(null))
        .catch((/* err */) => {
          // ignore err: a failure to notify Bugsnag shouldn't fail the build
          // plus the detail will already have been logged to the console
          cb(null)
        })
    }
    if (compiler.hooks) {
      // webpack v4
      compiler.hooks.afterEmit.tapAsync('BugsnagBuildReporterPlugin', plugin)
    } else {
      // webpack v3
      compiler.plugin('after-emit', plugin)
    }
  }
}

module.exports = BugsnagBuildReporterPlugin
