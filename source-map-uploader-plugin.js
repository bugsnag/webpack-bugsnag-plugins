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
    this.bundle = options.bundle
    this.bundleUrl = options.bundleUrl
    this.overwrite = options.overwrite
    this.endpoint = options.endpoint
    this.ignoredBundleExtensions = options.ignoredBundleExtensions || ['.css']
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

    const plugin = (compilation, cb) => {
      const compiler = compilation.compiler
      const stats = compilation.getStats().toJson()
      const publicPath = this.publicPath || stats.publicPath || ''
      const outputPath = compilation.getPath(compiler.outputPath)
      const logger = compiler.getInfrastructureLogger ? compiler.getInfrastructureLogger('BugsnagSourceMapUploaderPlugin') : console
      const logPrefix = compiler.getInfrastructureLogger ? '' : `${LOG_PREFIX} `

      const chunkToSourceMapDescriptors = (chunk) => {
        // Determine which property to use for source maps based on Webpack version
        const mapFiles = chunk[webpackMajorVersion >= 5 ? 'auxiliaryFiles' : 'files']
          .filter(file => file.endsWith('.map'))

        if (!publicPath) {
          logger.warn(`${logPrefix}${PUBLIC_PATH_WARN}`)
        }

        return mapFiles.map(map => {
          // Find the corresponding source file for the map
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

          let url = this.minifiedUrl || (publicPath.replace(/[^/]$/, '$&/') + source.replace(/^\.\//, ''))
          // Check if this.minifyBundleUrls is set to true
          if (this.minifyBundleUrls) {
            // replace hash in url with wildcard
            url = url.replace(/\.[a-f0-9]{8,}\./, '.*.')
          }

          // replace parent directory references with empty string
          url = url.replace(/\.\.\//g, '')

          return {
            source: outputChunkLocation,
            map: outputSourceMapLocation,
            url: url,
            chunkName: chunk.names[0] || 'unknown',
            hash: chunk.hash || ''
          }
        }).filter(Boolean)
      }

      const sourceMaps = stats.chunks.map(chunkToSourceMapDescriptors).reduce((accum, ds) => accum.concat(ds), [])
      parallel(sourceMaps.map(sm => cb => {
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
          })
          .catch((error) => {
            // Split error by lines, prefix each line, and log them
            error.toString().split('\n').forEach((line) => {
              logger.error(`${logPrefix}${line}`)
            })
          })
      }), 10, cb)
    }

    if (compiler.hooks) {
      // webpack v4
      compiler.hooks.afterEmit.tapAsync('BugsnagSourceMapUploaderPlugin', plugin)
    } else {
      // webpack v3
      compiler.plugin('after-emit', plugin)
    }
  }

  getUploadOpts (sm) {
    const opts = {
      apiKey: this.apiKey,
      appVersion: this.appVersion,
      codeBundleId: this.codeBundleId,
      bundleUrl: this.bundleUrl || sm.url,
      bundle: this.bundle || sm.source,
      sourceMap: sm.map
    }
    if (this.endpoint) opts.endpoint = this.endpoint
    if (this.overwrite) opts.overwrite = this.overwrite

    return opts
  }

  bugsnagCliUploadOpts (sm) {
    const opts = this.getUploadOpts(sm)

    // If bundleUrl is provided, replace placeholders dynamically
    if (this.bundleUrl) {
      opts.bundleUrl = this.bundleUrl
        .replace(/\[name\]/g, sm.chunkName) // Replace [name] with chunk name
    }

    // Validate required fields
    if (!opts.apiKey) {
      console.error('Error: API key is required but was not provided.')
      return null
    }

    // Command base
    const cmdOpts = {
      apiKey: opts.apiKey,
      projectRoot: process.cwd()
    }

    // Optional options
    const optionalParams = {
      uploadApiRootUrl: opts.endpoint,
      bundleUrl: opts.bundleUrl,
      versionName: opts.appVersion,
      sourceMap: opts.sourceMap,
      bundle: opts.bundle,
      codeBundleId: opts.codeBundleId
    }

    for (const [key, value] of Object.entries(optionalParams)) {
      if (value !== undefined) {
        cmdOpts[key] = value
      }
    }

    // Boolean flags
    if (opts.overwrite) {
      cmdOpts.overwrite = true
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
