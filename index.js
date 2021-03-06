const through = require('through2')
const PluginError = require('plugin-error')
const replaceExt = require('replace-ext')

const VueCompiler = require('@vialer/vue-compiler')

const PLUGIN_NAME = 'vue-compiler-gulp'


function vueCompilerGulp(options) {
    let defaults = {
        namespace: 'window.templates',
        commonjs: false,
        pathfilter: [],
        vue: {
            preserveWhitespace: false,
        },
    }

    options = Object.assign(defaults, options)
    const vueCompiler = new VueCompiler(Object.assign(defaults, options))

    return through.obj(function(file, encode, callback) {
        if (file.isNull()) {
            callback(null, file)
            return
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'))
            callback()
            return
        }

        let target = file.path.replace(`${process.cwd()}/`, '')
        vueCompiler.processFile(file.contents.toString(), target).then((result) => {
            file.path = replaceExt(file.path, '.js')
            file.contents = Buffer.from(result.data)
            callback(null, file)
        })
        .catch((err) => {
            this.emit('error', new PluginError(PLUGIN_NAME, `${target}: ${err}`))
        })
    })
}

module.exports = vueCompilerGulp
