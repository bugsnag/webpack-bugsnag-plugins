import test from 'tape'
import Plugin from '../build-reporter-plugin.js'
import { createServer } from 'http'
import { exec } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const generateEnv = (server) => {
  // The openssl-legacy-provider is required for webpack4 in node 18 and up - see https://github.com/webpack/webpack/issues/14532
  const nodeOptions = (parseInt(process.versions.node.split('.')[0]) >= 18) ? { NODE_OPTIONS: '--openssl-legacy-provider' } : {}
  return Object.assign({}, process.env, { PORT: server.address().port }, nodeOptions)
}

test('BugsnagBuildReporterPlugin', t => {
  const p = new Plugin({})
  t.equal(p.options.logLevel, 'warn', 'default logLevel should be "warn"')
  t.equal(p.build.buildTool, 'webpack-bugsnag-plugins', 'build.buildTool should be set')
  t.end()
})

test('it sends upon successful build', t => {
  t.plan(4)
  const server = createServer((req, res) => {
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
      t.same(j.metadata, { foo: 'bar', baz: 'qux' }, 'body should contain correct metadata')
    })
  })
  server.listen()

  // Add timeout to prevent hanging
  const timeout = setTimeout(() => {
    server.close()
    t.fail('Test timed out - webpack process may be hanging')
    t.end()
  }, 30000) // 30 second timeout

  exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
    env: generateEnv(server),
    cwd: join(__dirname, 'fixtures', 'a')
  }, (err, stdout, stderr) => {
    clearTimeout(timeout)
    server.close()
    if (err) { console.info(err, '\n\n\n', stdout, '\n\n\n', stderr) }
    if (err) return t.fail(err.message)
    t.end()
  })
})

test('it doesn’t send upon unsuccessful build', t => {
  t.plan(1)
  const server = createServer((req, res) => {
    req.on('data', (d) => {})
    req.on('end', () => {
      t.fail('no requests should hit the server')
      server.close()
    })
  })
  server.listen()

  // Add timeout to prevent hanging
  const timeout = setTimeout(() => {
    server.close()
    t.fail('Test timed out - webpack process may be hanging')
    t.end()
  }, 30000) // 30 second timeout

  exec(join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
    env: generateEnv(server),
    cwd: join(__dirname, 'fixtures', 'b')
  }, (err, stdout, stderr) => {
    clearTimeout(timeout)
    server.close()
    t.ok(err, 'webpack should fail due to syntax error')
    t.end()
  })
})
