const fs = require('fs');
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default

module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/i18n.js',
  ],
  output: './',
  options: {
    debug: false,
    removeUnusedKeys: true,
    sort: false,
    func: {
      list: ['t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
    },
    lngs: ['es', 'en', 'zh'],
    ns: ['translation'],
    defaultLng: 'es',
    defaultNs: 'translation',
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
    },
    keySeparator: false,
    nsSeparator: false,
    interpolation: { prefix: '{{', suffix: '}}' },
  },
  transform(file, enc, done) {
  const parser = this.parser
  const content = fs.readFileSync(file.path, enc)

  parser.parseFuncFromString(content, { list: ['t', 'i18n.t'] })

  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  })

  traverse(ast, {
    ObjectProperty(path) {
      const key = path.node.key.name
      const val = path.node.value
      if (
        ['title','subtitle','namePurchased','tag', 'name', 'mode', 'label'].includes(key)
        && val.type === 'StringLiteral'
      ) {
        parser.set(val.value, {
          key: val.value,
        })
      }
    }
  })

  done()
}
}

/* && node --loader ts-node/esm scripts/translate.ts */
