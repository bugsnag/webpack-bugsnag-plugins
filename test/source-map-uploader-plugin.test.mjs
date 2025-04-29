import test from 'tape'
import Plugin from '../source-map-uploader-plugin.js'
import { createServer } from 'http'
import formidable from 'formidable'
import { exec } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import once from 'once'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const generateEnv = (server, other = {}) => {
  // The openssl-legacy-provider is required for webpack4 in node 18 and up - see https://github.com/webpack/webpack/issues/14532
  const nodeOptions = (parseInt(process.versions.node.split('.')[0]) >= 18) ? { NODE_OPTIONS: '--openssl-legacy-provider' } : {}
  return Object.assign({}, process.env, { PORT: server.address().port }, nodeOptions, other)
}

const validateParts = (parts, t, end) => {
  const data = fs.readFileSync(parts.sourceMap[0].filepath)
  t.equal(parts.sourceMap[0].mimetype, 'application/octet-stream')
  try {
    t.ok(JSON.parse(data), 'sourceMap should be valid json')
  } catch (e) {
    end(e)
  }
  t.equal(parts.minifiedFile[0].mimetype, 'application/octet-stream')
  t.ok(fs.readFileSync(parts.sourceMap[0].filepath).length !== 0, 'js bundle should have size')
}

test('BugsnagSourceMapUploaderPlugin', t => {
  try {
    const p = new Plugin({})
    p.apply()
  } catch (e) {
    t.ok(e, 'api key should be required')
    t.ok(/apiKey/.test(e.message), 'apiKey should be present in error message')
  }
  try {
    t.ok(new Plugin({ apiKey: 'YOUR_API_KEY' }), 'it should work with all required options')
  } catch (e) {
    t.fail(e.message)
  }
  t.end()
})

test('it sends upon successful build (example project #1)', t => {
  const end = err => {
    server.close()
    if (err) return t.fail(err.message)
    t.end()
  }

  t.plan(8)
  const server = createServer((req, res) => {
    formidable().parse(req, once(function (err, fields, parts) {
      if (err) {
        res.end('ERR')
        return end(err)
      }
      t.equal(fields.apiKey[0], 'YOUR_API_KEY', 'body should contain api key')
      t.equal(fields.codeBundleId[0], '1.0.0-b12', 'body could contain codeBundleId')
      t.ok(/^https:\/\/foobar.com\/js\/main\.js\?[\w\d]+$/.test(fields.minifiedUrl[0]), 'body should contain minified url')
      t.equal(Object.keys(parts).length, 2, 'body should contain 2 uploads')
      validateParts(parts, t, end)
      res.end('OK')
      end()
    }))
  })
  server.listen()
  exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
    env: generateEnv(server),
    cwd: join(__dirname, 'fixtures', 'd')
  }, (err, stdout, stderr) => {
    if (err) {
      console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
      end(err)
    }
  })
})

test('it sends upon successful build (example project #2)', t => {
  const end = err => {
    server.close()
    if (err) return t.fail(err.message)
    t.end()
  }

  t.plan(7)
  const server = createServer((req, res) => {
    formidable().parse(req, once(function (err, fields, parts) {
      if (err) {
        res.end('ERR')
        return end(err)
      }
      t.equal(fields.apiKey[0], 'YOUR_API_KEY', 'body should contain api key')
      t.equal(fields.minifiedUrl[0], 'https://foobar.com/js/bundle.js', 'body should contain minified url')
      t.equal(Object.keys(parts).length, 2, 'body should contain 2 uploads')
      validateParts(parts, t, end)
      res.end('OK')
      end()
    }))
  })
  server.listen()
  exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
    env: generateEnv(server),
    cwd: join(__dirname, 'fixtures', 'c')
  }, (err, stdout, stderr) => {
    if (err) {
      console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
      end(err)
    }
  })
})

if (process.env.WEBPACK_VERSION !== '3') {
  test('it’s able to locate the files when source maps are written to a different directory', t => {
    const end = err => {
      server.close()
      if (err) return t.fail(err.message)
      t.end()
    }

    t.plan(7)
    const server = createServer((req, res) => {
      formidable().parse(req, once(function (err, fields, parts) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        t.equal(fields.apiKey[0], 'YOUR_API_KEY', 'body should contain api key')
        t.equal(fields.minifiedUrl[0], '*/dist/main.js', 'body should contain minified url')
        t.equal(Object.keys(parts).length, 2, 'body should contain 2 uploads')
        validateParts(parts, t, end)
        res.end('OK')
        end()
      }))
    })
    server.listen()
    exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
      env: generateEnv(server),
      cwd: join(__dirname, 'fixtures', 'f')
    }, (err, stdout, stderr) => {
      if (err) {
        console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
        end(err)
      }
    })

    test('it removes any "../" from chunk paths', t => {
      const end = err => {
        server.close()
        if (err) return t.fail(err.message)
        t.end()
      }

      t.plan(7)
      const server = createServer((req, res) => {
        formidable().parse(req, once(function (err, fields, parts) {
          if (err) {
            res.end('ERR')
            return end(err)
          }
          t.equal(fields.apiKey[0], 'YOUR_API_KEY', 'body should contain api key')
          t.equal(fields.minifiedUrl[0], 'https://foobar.com/js/static/chunks/main.js', 'body should contain minified url')
          t.equal(Object.keys(parts).length, 2, 'body should contain 2 uploads')
          validateParts(parts, t, end)
          res.end('OK')
          end()
        }))
      })
      server.listen()
      exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
        env: generateEnv(server),
        cwd: join(__dirname, 'fixtures', 'h')
      }, (err, stdout, stderr) => {
        if (err) {
          console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
          end(err)
        }
      })
    })

    test('it ignores source maps for css files by default', t => {
      t.plan(7)
      t.plan(3)
      const requests = []
      const end = err => {
        clearTimeout(timeout)
        server.close()
        if (err) return t.fail(err.message)
        t.end()
      }

      // prevent test hanging forever
      const timeout = setTimeout(end, 10000)

      const done = () => {
        t.equal(requests[0].minifiedUrl, '*/dist/main.js')
        t.match(requests[0].parts[1].filename, /main\.js$/)
        t.match(requests[0].parts[0].filename, /main\.js\.map$/)
        end()
      }

      const server = createServer((req, res) => {
        formidable().parse(req, once(function (err, fields, parts) {
          if (err) {
            res.end('ERR')
            return end(err)
          }
          requests.push({
            apiKey: fields.apiKey[0],
            minifiedUrl: fields.minifiedUrl[0],
            parts: Object.keys(parts).map(name => ({ name, filename: parts[name][0].originalFilename }))
          })
          res.end('OK')
          done()
        }))
      })
      server.listen()
      exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
        env: generateEnv(server),
        cwd: join(__dirname, 'fixtures', 'e')
      }, (err, stdout, stderr) => {
        if (err) {
          console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
          end(err)
        }
      })
    })
  })

  test('it uploads css map files if you really want', t => {
    t.plan(6)
    const requests = []
    const end = err => {
      clearTimeout(timeout)
      server.close()
      if (err) return t.fail(err.message)
      t.end()
    }

    // prevent test hanging forever
    const timeout = setTimeout(end, 10000)

    const done = () => {
      requests.sort((a, b) => a.minifiedUrl < b.minifiedUrl ? -1 : 1)
      t.equal(requests[0].minifiedUrl, '*/dist/main.css')
      t.match(requests[0].parts[0].filename, /main\.css/)
      t.match(requests[0].parts[0].filename, /main\.css\.map/)
      t.equal(requests[1].minifiedUrl, '*/dist/main.js')
      t.match(requests[1].parts[0].filename, /main\.js/)
      t.match(requests[1].parts[0].filename, /main\.js\.map/)
      end()
    }

    const server = createServer((req, res) => {
      formidable().parse(req, once(function (err, fields, parts) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        requests.push({
          apiKey: fields.apiKey[0],
          minifiedUrl: fields.minifiedUrl[0],
          parts: Object.keys(parts).map(name => ({ name, filename: parts[name][0].originalFilename }))
        })
        res.end('OK')
        if (requests.length < 2) return
        done()
      }))
    })
    server.listen()
    exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
      env: generateEnv(server, { IGNORED_EXTENSIONS: '.php,.exe' }),
      cwd: join(__dirname, 'fixtures', 'e')
    }, (err, stdout, stderr) => {
      if (err) {
        console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
        end(err)
      }
    })
  })

  test('it sends upon successful build (output.futureEmitAssets=true)', t => {
    const end = err => {
      server.close()
      if (err) return t.fail(err.message)
      t.end()
    }

    t.plan(7)
    const server = createServer((req, res) => {
      formidable().parse(req, once(function (err, fields, parts) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        t.equal(fields.apiKey[0], 'YOUR_API_KEY', 'body should contain api key')
        t.equal(fields.minifiedUrl[0], 'https://foobar.com/js/bundle.js', 'body should contain minified url')
        t.equal(Object.keys(parts).length, 2, 'body should contain 2 uploads')
        validateParts(parts, t, end)
        res.end('OK')
        end()
      }))
    })
    server.listen()
    exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
      env: generateEnv(server),
      cwd: join(__dirname, 'fixtures', 'g')
    }, (err, stdout, stderr) => {
      if (err) {
        console.info(err, '\n\n\n', stdout, '\n\n\n', stderr)
        end(err)
      }
    })
  })
}
