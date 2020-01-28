'use strict'

const test = require('tape')
const Plugin = require('../source-map-uploader-plugin')
const http = require('http')
const parseFormdata = require('parse-formdata')
const exec = require('child_process').exec
const concat = require('concat-stream')

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
  const server = http.createServer((req, res) => {
    parseFormdata(req, function (err, data) {
      if (err) {
        res.end('ERR')
        return end(err)
      }
      t.equal(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key')
      t.equal(data.fields.codeBundleId, '1.0.0-b12', 'body could contain codeBundleId')
      t.ok(/^https:\/\/foobar.com\/js\/main\.js\?[\w\d]+$/.test(data.fields.minifiedUrl), 'body should contain minified url')
      t.equal(data.parts.length, 2, 'body should contain 2 uploads')
      let partsRead = 0
      data.parts.forEach(part => {
        part.stream.pipe(concat(data => {
          partsRead++
          if (part.name === 'sourceMap') {
            t.equal(part.mimetype, 'application/json')
            try {
              t.ok(JSON.parse(data), 'sourceMap should be valid json')
            } catch (e) {
              end(e)
            }
          }
          if (part.name === 'minifiedFile') {
            t.equal(part.mimetype, 'application/javascript')
            t.ok(data.length, 'js bundle should have length')
          }
          if (partsRead === 2) end()
        }))
      })
      res.end('OK')
    })
  })
  server.listen()
  exec(`${__dirname}/../node_modules/.bin/webpack`, {
    env: Object.assign({}, process.env, { PORT: server.address().port }),
    cwd: `${__dirname}/fixtures/d`
  }, (err, stdout, stderr) => {
    if (err) end(err)
  })
})

test('it sends upon successful build (example project #2)', t => {
  const end = err => {
    server.close()
    if (err) return t.fail(err.message)
    t.end()
  }

  t.plan(7)
  const server = http.createServer((req, res) => {
    parseFormdata(req, function (err, data) {
      if (err) {
        res.end('ERR')
        return end(err)
      }
      t.equal(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key')
      t.equal(data.fields.minifiedUrl, 'https://foobar.com/js/bundle.js', 'body should contain minified url')
      t.equal(data.parts.length, 2, 'body should contain 2 uploads')
      let partsRead = 0
      data.parts.forEach(part => {
        part.stream.pipe(concat(data => {
          partsRead++
          if (part.name === 'sourceMap') {
            t.equal(part.mimetype, 'application/json')
            try {
              t.ok(JSON.parse(data), 'sourceMap should be valid json')
            } catch (e) {
              end(e)
            }
          }
          if (part.name === 'minifiedFile') {
            t.equal(part.mimetype, 'application/javascript')
            t.ok(data.length, 'js bundle should have length')
          }
          if (partsRead === 2) end()
        }))
      })
      res.end('OK')
    })
  })
  server.listen()
  exec(`${__dirname}/../node_modules/.bin/webpack`, {
    env: Object.assign({}, process.env, { PORT: server.address().port }),
    cwd: `${__dirname}/fixtures/c`
  }, err => {
    if (err) end(err)
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
    const server = http.createServer((req, res) => {
      parseFormdata(req, function (err, data) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        t.equal(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key')
        t.equal(data.fields.minifiedUrl, '*/dist/main.js', 'body should contain minified url')
        t.equal(data.parts.length, 2, 'body should contain 2 uploads')
        let partsRead = 0
        data.parts.forEach(part => {
          part.stream.pipe(concat(data => {
            partsRead++
            if (part.name === 'sourceMap') {
              t.equal(part.mimetype, 'application/json')
              try {
                t.ok(JSON.parse(data), 'sourceMap should be valid json')
              } catch (e) {
                end(e)
              }
            }
            if (part.name === 'minifiedFile') {
              t.equal(part.mimetype, 'application/javascript')
              t.ok(data.length, 'js bundle should have length')
            }
            if (partsRead === 2) end()
          }))
        })
        res.end('OK')
      })
    })
    server.listen()
    exec(`${__dirname}/../node_modules/.bin/webpack`, {
      env: Object.assign({}, process.env, { PORT: server.address().port }),
      cwd: `${__dirname}/fixtures/f`
    }, err => {
      if (err) end(err)
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
        t.equal(requests[0].parts[0].filename, 'main.js.map')
        t.equal(requests[0].parts[1].filename, 'main.js')
        end()
      }

      const server = http.createServer((req, res) => {
        parseFormdata(req, function (err, data) {
          if (err) {
            res.end('ERR')
            return end(err)
          }
          requests.push({
            apiKey: data.fields.apiKey,
            minifiedUrl: data.fields.minifiedUrl,
            parts: data.parts.map(p => ({ name: p.name, filename: p.filename }))
          })
          res.end('OK')
          done()
        })
      })
      server.listen()
      exec(`${__dirname}/../node_modules/.bin/webpack`, {
        env: Object.assign({}, process.env, { PORT: server.address().port }),
        cwd: `${__dirname}/fixtures/e`
      }, (err) => {
        if (err) end(err)
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
      t.equal(requests[0].parts[0].filename, 'main.css.map')
      t.equal(requests[0].parts[1].filename, 'main.css')
      t.equal(requests[1].minifiedUrl, '*/dist/main.js')
      t.equal(requests[1].parts[0].filename, 'main.js.map')
      t.equal(requests[1].parts[1].filename, 'main.js')
      end()
    }

    const server = http.createServer((req, res) => {
      parseFormdata(req, function (err, data) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        requests.push({
          apiKey: data.fields.apiKey,
          minifiedUrl: data.fields.minifiedUrl,
          parts: data.parts.map(p => ({ name: p.name, filename: p.filename }))
        })
        res.end('OK')
        if (requests.length < 2) return
        done()
      })
    })
    server.listen()
    exec(`${__dirname}/../node_modules/.bin/webpack`, {
      env: Object.assign({}, process.env, { PORT: server.address().port, IGNORED_EXTENSIONS: '.php,.exe' }),
      cwd: `${__dirname}/fixtures/e`
    }, (err) => {
      if (err) end(err)
    })
  })

  test('it sends upon successful build (output.futureEmitAssets=true)', t => {
    const end = err => {
      server.close()
      if (err) return t.fail(err.message)
      t.end()
    }

    t.plan(7)
    const server = http.createServer((req, res) => {
      parseFormdata(req, function (err, data) {
        if (err) {
          res.end('ERR')
          return end(err)
        }
        t.equal(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key')
        t.equal(data.fields.minifiedUrl, 'https://foobar.com/js/bundle.js', 'body should contain minified url')
        t.equal(data.parts.length, 2, 'body should contain 2 uploads')
        let partsRead = 0
        data.parts.forEach(part => {
          part.stream.pipe(concat(data => {
            partsRead++
            if (part.name === 'sourceMap') {
              t.equal(part.mimetype, 'application/json')
              try {
                t.ok(JSON.parse(data), 'sourceMap should be valid json')
              } catch (e) {
                end(e)
              }
            }
            if (part.name === 'minifiedFile') {
              t.equal(part.mimetype, 'application/javascript')
              t.ok(data.length, 'js bundle should have length')
            }
            if (partsRead === 2) end()
          }))
        })
        res.end('OK')
      })
    })
    server.listen()
    exec(`${__dirname}/../node_modules/.bin/webpack`, {
      env: Object.assign({}, process.env, { PORT: server.address().port }),
      cwd: `${__dirname}/fixtures/g`
    }, err => {
      if (err) end(err)
    })
  })
}
