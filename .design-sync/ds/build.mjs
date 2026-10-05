// Builds the design-sync package: dist/index.js (+ .d.ts) and dist/index.css.
import { build } from '../../.ds-sync/node_modules/esbuild/lib/main.js'
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const out = path.resolve(here, '../pkg/dist')
const req = createRequire(path.join(root, 'package.json'))
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(out, { recursive: true })

await build({
  entryPoints: [path.join(here, 'index.ts')],
  outfile: path.join(out, 'index.js'),
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  alias: {
    'next-intl': path.join(here, 'stubs/next-intl.tsx'),
    '@/i18n/navigation': path.join(here, 'stubs/navigation.tsx'),
    '@': path.join(root, 'src'),
  },
  nodePaths: [path.join(root, 'node_modules')],
  loader: { '.json': 'json' },
  logLevel: 'warning',
})

const postcss = req('postcss')
const tw = req('@tailwindcss/postcss')
const src = fs.readFileSync(path.join(here, 'styles.css'), 'utf8')
const res = await postcss([tw()]).process(src, { from: path.join(here, 'styles.css') })
fs.writeFileSync(path.join(out, 'index.css'), res.css)

fs.writeFileSync(
  path.join(here, 'tsconfig.json'),
  JSON.stringify({
    extends: '../../tsconfig.json',
    compilerOptions: {
      noEmit: false, declaration: true, emitDeclarationOnly: true, incremental: false,
      outDir: '../pkg/dist/types', rootDir: '../..', skipLibCheck: true,
    },
    include: ['index.ts', 'stubs/*.tsx', '../../src/payload-types.ts'],
  }),
)
try {
  execSync('npx tsc -p .design-sync/ds/tsconfig.json', { cwd: root, stdio: 'inherit' })
} catch {}
const dts = path.join(out, 'types/.design-sync/ds/index.d.ts')
if (fs.existsSync(dts))
  fs.writeFileSync(
    path.join(out, 'index.d.ts'),
    fs.readFileSync(dts, 'utf8').replaceAll('../../src/', './types/src/'),
  )
console.log('built', fs.readdirSync(out))
