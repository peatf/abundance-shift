// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js', // Your library's main entry point
  output: [
    {
      file: 'dist/index.js', // CommonJS format
      format: 'cjs',
      sourcemap: true,
      exports: 'auto', // Handles different export patterns
    },
    {
      file: 'dist/index.esm.js', // ES Module format
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    // 1. Resolve modules first (helps Babel and PostCSS find imports)
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'], // Ensure it resolves .jsx and other types if you use them
    }),

    // 2. Process CSS (if components import CSS directly)
    // Ensure your project has a tailwind.config.js if you uncomment the tailwindcss line.
    // For now, keeping it simple. If you have Tailwind specific syntax in your CSS,
    // you'll need to configure it.
    postcss({
      extensions: ['.css'],
      minimize: true,
      inject: {
        insertAt: 'top',
      },
      // Example for Tailwind (ensure tailwindcss and autoprefixer are in devDependencies)
      // plugins: [
      //   require('tailwindcss'), // Needs a tailwind.config.js
      //   require('autoprefixer'),
      // ]
    }),

    // 3. Transpile with Babel (handles JSX and modern JS)
    // THIS MUST COME BEFORE commonjs()
    babel({
      babelHelpers: 'runtime', // <--- CHANGE THIS FROM 'bundled'
      exclude: 'node_modules/**',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),

    // 4. Convert CommonJS modules to ES6 (for Rollup to process)
    // Now that JSX is handled, commonjs can do its work.
    commonjs(),

    // 5. Minify the output
    terser(),
  ],
  // Externalize peer dependencies
  // 'zustand' is used in your store, so it should be external if it's a peer dependency
  external: ['react', 'react-dom', 'zustand', /^@heroicons\//],
};