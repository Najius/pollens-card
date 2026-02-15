import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;

export default {
  input: 'src/pollens-card.ts',
  output: {
    file: 'dist/pollens-card.js',
    format: 'es',
    sourcemap: dev ? true : false,
  },
  plugins: [
    resolve(),
    typescript(),
    !dev && terser(),
    dev &&
      serve({
        contentBase: ['./dist'],
        host: '0.0.0.0',
        port: 5000,
        allowCrossOrigin: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }),
  ].filter(Boolean),
};
