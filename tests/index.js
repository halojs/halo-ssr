import koa from 'koa'
import test from 'ava'
import ssr from '../src'
import request from 'request'

const req = request.defaults({
    json: true,
    baseUrl: 'http://localhost:3000'
})

test.before.cb((t) => {
    let app = new koa()

    app.use(ssr('./tests/dist/vue-ssr-server-bundle.json', {
        template: './tests/dist/index.html',
        clientManifest: './tests/dist/vue-ssr-client-manifest.json'
    }))
    
    app.listen(3000, t.end)
})

test.cb('get /hello url, return html should contains data-server-rendered flag', (t) => {
    req.get('/hello', (err, res, body) => {
        t.is(body.includes('data-server-rendered="true"'), true)
        t.is(body.includes('Hello World'), true)
        t.end()
    })
})

test.cb('get /welcome url, return html should contains data-server-rendered flag', (t) => {
    req.get('/welcome', (err, res, body) => {
        t.is(body.includes('data-server-rendered="true"'), true)
        t.is(body.includes('Welcome'), true)
        t.end()
    })
})