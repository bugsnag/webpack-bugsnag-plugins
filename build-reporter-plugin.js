const reportBuild = require('bugsnag-build-reporter')

class BugsnagBuildReporterPlugin {
  constructor (build, options) {
    this.build = build
    this.options = Object.assign({ logLevel: 'warn' }, options)
  }

  apply (compiler) {
    compiler.plugin('after-emit', (compilation, cb) => {
      const stats = compilation.getStats()
      if (stats.hasErrors()) return cb(null)
      reportBuild(this.build, this.options)
        .then(() => cb(null))
        .catch((err) => cb(err))
    })
  }
}

module.exports = BugsnagBuildReporterPlugin
