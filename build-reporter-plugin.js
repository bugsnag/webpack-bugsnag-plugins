'use strict'

const BugsnagCLI = require('@bugsnag/cli')

const LOG_PREFIX = '[BugsnagBuildReporterPlugin]'

class BugsnagBuildReporterPlugin {
  constructor (build, options = {}) {
    this.apiKey = options.apiKey
    this.appVersion = options.appVersion
    this.autoAssignRelease = options.autoAssignRelease
    this.builderName = options.builderName
    this.metadata = options.metadata
    this.provider = options.provider
    this.releaseStage = options.releaseStage
    this.repository = options.repository
    this.revision = options.revision
    this.overwrite = options.overwrite
    this.endpoint = options.endpoint
    this.verbose = options.verbose
    this.logLevel = options.logLevel || 'warn'

    this.build = Object.assign({ buildTool: 'webpack-bugsnag-plugins' }, build)
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
      apiKey: opts.apiKey,
      versionName: opts.appVersion
    }

    // Optional options
    const optionalOpts = {
      autoAssignRelease: opts.autoAssignRelease,
      builderName: opts.builderName,
      metadata: opts.metadata,
      provider: opts.provider,
      releaseStage: opts.releaseStage,
      repository: opts.repository,
      revision: opts.revision,
      endpoint: opts.endpoint,
      logLevel: opts.logLevel
    }

    for (const [key, value] of Object.entries(optionalOpts)) {
      if (value !== undefined) {
        buildOpts[key] = value
      }
    }

    // Handle boolean options
    if (opts.overwrite) {
      buildOpts.overwrite = true
    }

    if (opts.verbose) {
      buildOpts.verbose = true
    }
    if (opts.autoAssignRelease) {
      buildOpts.autoAssignRelease = true
    }

    return buildOpts
  }
}

module.exports = BugsnagBuildReporterPlugin
