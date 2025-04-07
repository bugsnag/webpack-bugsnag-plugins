'use strict'

const BugsnagCLI = require('@bugsnag/cli')

const LOG_PREFIX = '[BugsnagBuildReporterPlugin]'

class BugsnagBuildReporterPlugin {
  constructor (build, options) {
    this.build = Object.assign({ buildTool: 'webpack-bugsnag-plugins' }, build)
    this.options = Object.assign({ logLevel: 'warn' }, options)
  }

  apply (compiler) {
    const plugin = (compilation, cb) => {
      const stats = compilation.getStats()
      if (stats.hasErrors()) return cb(null)
      const logger = compiler.getInfrastructureLogger ? compiler.getInfrastructureLogger('BugsnagSourceMapUploaderPlugin') : console
      const logPrefix = compiler.getInfrastructureLogger ? '' : `${LOG_PREFIX} `
      const cmdopts = this.getBuildOpts(this)

      logger.info(`${logPrefix}creating build for version "${cmdopts.versionName}" using the bugsnag-cli`)

      for (const [key, value] of Object.entries(cmdopts)) {
        logger.debug(`${logPrefix}${key}: ${value}`)
      }

      BugsnagCLI.CreateBuild(cmdopts, process.cwd())
        .then((output) => {
          // Split output by lines, prefix each line, and log them
          output.split('\n').forEach((line) => {
            logger.info(`${logPrefix}${line}`)
          })
        })
        .catch((error) => {
          // Split error by lines, prefix each line, and log them
          error.toString().split('\n').forEach((line) => {
            logger.error(`${logPrefix}${line}`)
          })
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

  getBuildOpts (opts) {
    // Required options
    const buildOpts = {
      apiKey: opts.build.apiKey,
      versionName: opts.build.appVersion
    }

    // Optional options
    const optionalOpts = {
      autoAssignRelease: opts.build.autoAssignRelease,
      builderName: opts.build.builderName,
      metadata: opts.build.metadata,
      provider: opts.build.provider,
      releaseStage: opts.build.releaseStage,
      repository: opts.build.repository,
      revision: opts.build.revision,
      buildApiRootUrl: opts.build.endpoint,
      logLevel: opts.options.logLevel
    }

    for (const [key, value] of Object.entries(optionalOpts)) {
      if (value !== undefined) {
        buildOpts[key] = value
      }
    }

    return buildOpts
  }
}

module.exports = BugsnagBuildReporterPlugin
