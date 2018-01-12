'use strict'

const test = require('tape')
const Plugin = require('../build-reporter-plugin')
const http = require('http')
const exec = require('child_process').exec

test('BugsnagBuildReporterPlugin', t => {
  const p = new Plugin()
  t.equal(p.options.logLevel, 'warn', 'default logLevel should be "warn"')
  t.equal(p.build.buildTool, 'webpack-bugsnag-plugins', 'build.buildTool should be set')
  t.end()
})

test('it sends upon successful build', t => {
  t.plan(3)
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (d) => { body += d })
    req.on('end', () => {
      res.end('ok')
      let j
      try {
        j = JSON.parse(body)
      } catch (e) {
        server.close()
        t.fail('failed to parse body as json')
      }
      t.ok(j, 'json body was received')
      t.equal(j.appVersion, '1.2.3', 'body should contain app version')
      t.equal(j.apiKey, 'YOUR_API_KEY', 'body should contain api key')
    })
  })
  server.listen()
  exec(`${__dirname}/../node_modules/.bin/webpack`, {
    env: Object.assign({}, process.env, { PORT: server.address().port }),
    cwd: `${__dirname}/fixtures/a`
  }, (err, stdout) => {
    server.close()
    if (err) return t.fail(err.message)
    t.end()
  })
})

test('it doesn’t send upon unsuccessful build', t => {
  t.plan(1)
  const server = http.createServer((req, res) => {
    req.on('data', (d) => {})
    req.on('end', () => {
      t.fail('no requests should hit the server')
      server.close()
    })
  })
  server.listen()
  exec(`${__dirname}/../node_modules/.bin/webpack`, {
    env: Object.assign({}, process.env, { PORT: server.address().port }),
    cwd: `${__dirname}/fixtures/b`
  }, (err, stdout, stderr) => {
    server.close()
    t.ok(err)
    t.end()
  })
})
