import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const image = file => `data:image/${file.endsWith('.png') ? 'png' : 'jpeg'};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}`;
const textures = { portrait: image('Profilepic.png'), investo: image('assets/investo-home.jpg'), prepxa: image('assets/prepxa-home.jpg') };
await build({
  entryPoints: [path.join(root, 'studio-scene.mjs')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['chrome110', 'safari16'],
  outfile: path.join(root, 'assets/studio-scene.js'),
  plugins: [{ name: 'portfolio-textures', setup(builder) {
    builder.onResolve({ filter: /^portfolio-textures$/ }, () => ({ path: 'textures', namespace: 'portfolio' }));
    builder.onLoad({ filter: /.*/, namespace: 'portfolio' }, () => ({ contents: 'export default ' + JSON.stringify(textures), loader: 'js' }));
  } }]
});
const threeRoot = path.resolve(path.dirname(require.resolve('three')), '..');
fs.copyFileSync(path.join(threeRoot, 'LICENSE'), path.join(root, 'assets/THREE-LICENSE'));
console.log('Built the offline studio scene.');
