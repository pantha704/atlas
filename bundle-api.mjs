import esbuild from 'esbuild'
import path from 'path'

const root = process.cwd()

await esbuild.build({
  entryPoints: ['apps/api/src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  outfile: 'api/_bundle.mjs',
  external: ['hono', 'hono/vercel', 'hono/cors'],
  tsconfig: 'tsconfig.base.json',
  plugins: [{
    name: 'workspace-resolver',
    setup(build) {
      build.onResolve({ filter: /^@atlas\// }, (args) => {
        const pkg = args.path.replace('@atlas/', '')
        return { path: path.resolve(root, `packages/${pkg}/src/index.ts`) }
      })
    }
  }],
})
console.log('bundled to api/_bundle.mjs')
