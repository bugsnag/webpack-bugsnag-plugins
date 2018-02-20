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

  t.plan(7)
  const server = http.createServer((req, res) => {
    parseFormdata(req, function (err, data) {
      if (err) {
        res.end('ERR')
        return end(err)
      }
      t.equal(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key')
      t.equal(data.fields.minifiedUrl, 'https://foobar.com/js/main.js?68986425eee4dc839345', 'body should contain minified url')
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
  })
})
