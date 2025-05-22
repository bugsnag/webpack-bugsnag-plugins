'use strict'

const BugsnagCLI = require('@bugsnag/cli')

const LOG_PREFIX = '[BugsnagBuildReporterPlugin]'

class BugsnagBuildReporterPlugin {
  constructor (build, options) {
    this.build = Object.assign({ buildTool: 'webpack-bugsnag-plugins', sourceControl: {}, logLevel: 'warn', path: process.cwd() }, build)
    this.options = Object.assign({ buildTool: 'webpack-bugsnag-plugins', sourceControl: {}, logLevel: 'warn', path: process.cwd() }, options)
  }

  apply (compiler) {
    const plugin = (compilation, callback) => {
      const stats = compilation.getStats()
      if (stats.hasErrors()) return callback(null)
      const logger = compiler.getInfrastructureLogger ? compiler.getInfrastructureLogger('BugsnagBuildReporterPlugin') : console
      const logPrefix = compiler.getInfrastructureLogger ? '' : `${LOG_PREFIX} `
      const cmdopts = this.getBuildOpts(this)
      const path = this.options.path || this.build.path

      logger.info(`${logPrefix}creating build for version "${cmdopts.versionName}" using the bugsnag-cli`)

      for (const [key, value] of Object.entries(cmdopts)) {
        logger.debug(`${logPrefix}${key}: ${value}`)
      }

      BugsnagCLI.CreateBuild(cmdopts, path)
        .then((output) => {
          // Split output by lines, prefix each line, and log them
          output.split('\n').forEach((line) => {
            logger.info(`${logPrefix}${line}`)
          })
          callback()
        }, callback)
        .catch((error) => {
          // Split error by lines, prefix each line, and log them
          error.toString().split('\n').forEach((line) => {
            logger.error(`${logPrefix}${line}`)
          })
          callback()
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
      apiKey: opts.build.apiKey || opts.options.apiKey,
      versionName: opts.build.appVersion || opts.options.appVersion
    }

    // Optional options
    const optionalOpts = {
      autoAssignRelease: opts.build.autoAssignRelease || opts.options.autoAssignRelease,
      builderName: opts.build.builderName || opts.options.builderName,
      metadata: opts.build.metadata || opts.options.metadata,
      provider: opts.build.sourceControl.provider || opts.options.sourceControl.provider,
      repository: opts.build.sourceControl.repository || opts.options.sourceControl.repository,
      revision: opts.build.sourceControl.revision || opts.options.sourceControl.revision,
      releaseStage: opts.build.releaseStage || opts.options.releaseStage,
      buildApiRootUrl: opts.build.endpoint || opts.options.endpoint,
      logLevel: opts.build.logLevel || opts.options.logLevel,
      dryRun: opts.build.dryRun || opts.options.dryRun,
      verbose: opts.build.verbose || opts.options.verbose,
      retries: opts.build.retries || opts.options.retries,
      timeout: opts.build.timeout || opts.options.timeout
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
