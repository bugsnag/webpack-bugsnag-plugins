const reportBuild = require('bugsnag-build-reporter')
const pkg = require('./package.json')

class BugsnagBuildReporterPlugin {
  constructor (build, options) {
    this.build = Object.assign({ buildTool: `${pkg.name}@${pkg.version}` }, build)
    this.options = Object.assign({ logLevel: 'warn' }, options)
  }

  apply (compiler) {
    compiler.plugin('after-emit', (compilation, cb) => {
      const stats = compilation.getStats()
      if (stats.hasErrors()) return cb(null)
      reportBuild(this.build, this.options)
        .then(() => cb(null))
        .catch((/* err */) => {
          // ignore err: a failure to notify Bugsnag shouldn't fail the build
          // plus the detail will already have been logged to the console
          cb(null)
        })
    })
  }
}

module.exports = BugsnagBuildReporterPlugin
