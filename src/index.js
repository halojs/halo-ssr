import LRU from 'lru-cache'
import { readFileSync } from 'fs'
import { isAbsolute, resolve, join } from 'path'
import { createBundleRenderer } from 'vue-server-renderer'

export default function (bundle, options) {
    options = Object.assign({}, {
        template: '',
        clientManifest: '',
        runInNewContext: false
    }, options)

    bundle = toAbsolutePath(bundle)
    options.template = toAbsolutePath(options.template)
    options.clientManifest = toAbsolutePath(options.clientManifest)

    if (options.cache === undefined || options.cache === true) {
        options.cache = LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
        })
    }

    let renderer = createRenderer(bundle, options)

    return async function _ssr(ctx, next) {
        ctx.body = renderer.renderToStream({ url: ctx.url })
    }
}

function createRenderer(bundle, options) {
    bundle = JSON.parse(readFileSync(bundle, 'utf-8'))

    return createBundleRenderer(bundle, Object.assign({}, options, {
        template: readFileSync(options.template, 'utf-8'),
        clientManifest: JSON.parse(readFileSync(options.clientManifest, 'utf-8'))
    }))
}

function toAbsolutePath(path) {
    return isAbsolute(path) ? path : resolve(join(process.cwd(), path))
}