'use strict'

const upload = require('bugsnag-sourcemaps').upload
const resolve = require('url').resolve
const parallel = require('run-parallel-limit')
const extname = require('path').extname

const LOG_PREFIX = `[BugsnagSourceMapUploaderPlugin]`
const PUBLIC_PATH_ERR =
  'Cannot determine "minifiedUrl" argument for bugsnag-sourcemaps. ' +
  'Please set "publicPath" in Webpack config ("output" section) ' +
  'or set "publicPath" in BugsnagSourceMapUploaderPlugin constructor.'

class BugsnagSourceMapUploaderPlugin {
  constructor (options) {
    this.apiKey = options.apiKey
    this.publicPath = options.publicPath
    this.appVersion = options.appVersion
    this.overwrite = options.overwrite
    this.endpoint = options.endpoint
    this.ignoredBundleExtensions = options.ignoredBundleExtensions || [ '.css' ]
    this.transformSource = options.transformSource
    this.validate()
  }

  validate () {
    if (typeof this.apiKey !== 'string' || this.apiKey.length < 1) {
      throw new Error(`${LOG_PREFIX} "apiKey" is required`)
    }
  }

  apply (compiler) {
    const plugin = (compilation, cb) => {
      const compiler = compilation.compiler
      const stats = compilation.getStats().toJson()
      const publicPath = this.publicPath || stats.publicPath
      const outputPath = compilation.getPath(compiler.outputPath)

      if (!publicPath) {
        console.warn(`${LOG_PREFIX} ${PUBLIC_PATH_ERR}`)
        return cb()
      }

      const chunkToSourceMapDescriptors = chunk => {
        // find .map files in this chunk
        const maps = chunk.files.filter(file => /.+\.map(\?.*)?$/.test(file))

        return maps.map(map => {
          // for each *.map file, find a corresponding source file in the chunk
          const source = chunk.files.find(file => map.replace('.map', '').endsWith(file))

          if (!source) {
            console.warn(`${LOG_PREFIX} no corresponding source found for "${map}" in chunk "${chunk.id}"`)
            return null
          }

          if (!compilation.assets[source]) {
            console.debug(`${LOG_PREFIX} source asset not found in compilation output "${source}"`)
            return null
          }

          if (!compilation.assets[map]) {
            console.debug(`${LOG_PREFIX} source map not found in compilation output "${map}"`)
            return null
          }

          const outputChunkLocation = stripQuery(compiler.outputFileSystem.join(outputPath, source))
          const outputSourceMapLocation = stripQuery(compiler.outputFileSystem.join(outputPath, map))
          const outputSource = this.transformSource ? this.transformSource(source) : source

          if (!outputSource) {
            console.debug(`${LOG_PREFIX} transformSource should return string`)
            return null
          }

          // only include this file if its extension is not in the ignore list
          if (this.ignoredBundleExtensions.indexOf(extname(outputChunkLocation)) !== -1) {
            return null
          }

          return {
            source: outputChunkLocation,
            map: outputSourceMapLocation,
            url: resolve(
              // ensure publicPath has a trailing slash
              publicPath.replace(/[^/]$/, '$&/'),
              // ensure source doesn't have a leading slash (sometimes it does, e.g.
              // in laravel-mix, but this throws off the url resolve() call) see issue
              // for more detail: https://github.com/bugsnag/webpack-bugsnag-plugins/issues/11
              outputSource.replace(/^\//, '')
            ).toString()
          }
        }).filter(Boolean)
      }

      const sourceMaps = stats.chunks.map(chunkToSourceMapDescriptors).reduce((accum, ds) => accum.concat(ds), [])
      parallel(sourceMaps.map(sm => cb => {
        console.log(`${LOG_PREFIX} uploading sourcemap for "${sm.url}"`)
        upload(this.getUploadOpts(sm), cb)
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
      minifiedUrl: sm.url,
      minifiedFile: sm.source,
      sourceMap: sm.map
    }
    if (this.endpoint) opts.endpoint = this.endpoint
    if (this.overwrite) opts.overwrite = this.overwrite
    return opts
  }
}

module.exports = BugsnagSourceMapUploaderPlugin

// removes a querystring from a file path
const stripQuery = file => {
  const queryStringIdx = file.indexOf('?')
  if (queryStringIdx < 0) return file
  return file.substr(0, queryStringIdx)
}
