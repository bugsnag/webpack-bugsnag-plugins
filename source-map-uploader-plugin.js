'use strict'

const parallel = require('run-parallel-limit')
const extname = require('path').extname
const join = require('path').join
const webpackVersion = require('webpack').version
const BugsnagCLI = require('@bugsnag/cli')

const LOG_PREFIX = '[BugsnagSourceMapUploaderPlugin]'
const PUBLIC_PATH_WARN =
  '`publicPath` is not set.\n\n' +
  '  Source maps must be uploaded with the pattern that matches the file path in stacktraces.\n\n' +
  '  To make this message go away, set "publicPath" in Webpack config ("output" section)\n' +
  '  or set "publicPath" in BugsnagSourceMapUploaderPlugin constructor.\n\n' +
  '  In some cases, such as in a Node environment, it is safe to ignore this message.\n'

class BugsnagSourceMapUploaderPlugin {
  constructor (options) {
    this.apiKey = options.apiKey
    this.publicPath = options.publicPath
    this.appVersion = options.appVersion
    this.codeBundleId = options.codeBundleId
    this.overwrite = options.overwrite
    this.endpoint = options.endpoint
    this.bundle = options.bundle
    this.bundleUrl = options.bundleUrl
    this.ignoredBundleExtensions = options.ignoredBundleExtensions || ['.css']
    this.dryRun = options.dryRun
    this.logLevel = options.logLevel
    this.verbose = options.verbose
    this.retries = options.retries
    this.timeout = options.timeout
    this.validate()
  }

  validate () {
    if (typeof this.apiKey !== 'string' || this.apiKey.length < 1) {
      throw new Error(`${LOG_PREFIX} "apiKey" is required`)
    }
  }

  apply (compiler) {
    // considering this is used to check for a version >= 5, it's fine to default to 0.0.0 in case it's not set
    const webpackMajorVersion = parseInt((webpackVersion || '0.0.0').split('.')[0], 10)

    const plugin = (compilation, callback) => {
      const compiler = compilation.compiler
      const stats = compilation.getStats().toJson()
      const publicPath = this.publicPath || stats.publicPath || ''
      const outputPath = compilation.getPath(compiler.outputPath)
      const logger = compiler.getInfrastructureLogger ? compiler.getInfrastructureLogger('BugsnagSourceMapUploaderPlugin') : console
      const logPrefix = compiler.getInfrastructureLogger ? '' : `${LOG_PREFIX} `

      const chunkToSourceMapDescriptors = chunk => {
        // find .map files in this chunk
        const maps = chunk[webpackMajorVersion >= 5 ? 'auxiliaryFiles' : 'files'].filter(file => /.+\.map(\?.*)?$/.test(file))

        if (!publicPath) {
          logger.warn(`${logPrefix}${PUBLIC_PATH_WARN}`)
        }

        return maps.map(map => {
          // for each *.map file, find a corresponding source file in the chunk
          const source = chunk.files.find(file => map.replace('.map', '').endsWith(file))

          if (!source) {
            logger.warn(`${logPrefix}no corresponding source found for "${map}" in chunk "${chunk.id}"`)
            return null
          }

          if (!compilation.assets[source]) {
            logger.debug(`${logPrefix}source asset not found in compilation output "${source}"`)
            return null
          }

          if (!compilation.assets[map]) {
            logger.debug(`${logPrefix}source map not found in compilation output "${map}"`)
            return null
          }

          const outputChunkLocation = stripQuery(join(outputPath, source))
          const outputSourceMapLocation = stripQuery(join(outputPath, map))

          // only include this file if its extension is not in the ignore list
          if (this.ignoredBundleExtensions.indexOf(extname(outputChunkLocation)) !== -1) {
            return null
          }

          let url = '' +
            // ensure publicPath has a trailing slash
            publicPath.replace(/[^/]$/, '$&/') +
            // remove leading / or ./ from source
            source.replace(/^\.?\//, '')

          // replace parent directory references with empty string
          url = url.replace(/\.\.\//g, '')

          return {
            source: outputChunkLocation,
            map: outputSourceMapLocation,
            url: url
          }
        }).filter(Boolean)
      }

      const sourceMaps = stats.chunks.map(chunkToSourceMapDescriptors).reduce((accum, ds) => accum.concat(ds), [])
      parallel(sourceMaps.map(sm => callback => {
        const cmdOpts = this.bugsnagCliUploadOpts(sm)
        logger.info(`${logPrefix}uploading sourcemap for "${sm.url}" using the bugsnag-cli`)
        for (const [key, value] of Object.entries(cmdOpts)) {
          logger.debug(`${logPrefix}${key}: ${value}`)
        }
        BugsnagCLI.Upload.Js(cmdOpts, outputPath)
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
      }), 10, callback)
    }

    if (compiler.hooks) {
      // webpack v4
      compiler.hooks.afterEmit.tapAsync('BugsnagSourceMapUploaderPlugin', plugin)
    } else {
      // webpack v3
      compiler.plugin('after-emit', plugin)
    }
  }

  bugsnagCliUploadOpts (sm) {
    // Command base
    const cmdOpts = {
      apiKey: this.apiKey,
      projectRoot: process.cwd()
    }

    // Optional options
    const optionalParams = {
      uploadApiRootUrl: this.endpoint,
      bundleUrl: this.bundleUrl || sm.url,
      versionName: this.appVersion,
      sourceMap: sm.map,
      bundle: this.bundle || sm.source,
      codeBundleId: this.codeBundleId,
      overwrite: this.overwrite,
      dryRun: this.dryRun,
      logLevel: this.logLevel,
      verbose: this.verbose,
      retries: this.retries,
      timeout: this.timeout
    }

    for (const [key, value] of Object.entries(optionalParams)) {
      if (value !== undefined) {
        cmdOpts[key] = value
      }
    }

    return cmdOpts
  }
}
module.exports = BugsnagSourceMapUploaderPlugin

// removes a querystring from a file path
const stripQuery = file => {
  const queryStringIdx = file.indexOf('?')
  if (queryStringIdx < 0) return file
  return file.substr(0, queryStringIdx)
}
