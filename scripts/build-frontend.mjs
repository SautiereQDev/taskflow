#!/usr/bin/env node
/**
 * Frontend Build Script - esbuild configuration
 * Bundles TypeScript frontend code for browser with tree-shaking and minification
 */

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const isDev = process.env.NODE_ENV !== 'production';
const isWatch = process.argv.includes('--watch');

/**
 * esbuild configuration for frontend bundling
 */
const buildConfig = {
  // Entry points - TypeScript source files
  entryPoints: [join(rootDir, 'src/frontend/components/alpine-components.ts')],

  // Output directory - public/js/
  outdir: join(rootDir, 'public/js'),

  // Bundle all dependencies into single file
  bundle: true,

  // Minify in production, readable in dev
  minify: !isDev,

  // Generate sourcemaps for debugging
  sourcemap: isDev ? 'inline' : false,

  // IIFE format for browser compatibility (self-executing)
  format: 'iife',

  // Target modern browsers (ES2020 features)
  target: 'es2020',

  // Platform is browser (not Node.js)
  platform: 'browser',

  // Log level for build output
  logLevel: 'info',

  // Tree-shaking: remove unused code
  treeShaking: true,

  // Preserve import.meta for runtime detection
  supported: {
    'import-meta': true,
  },

  // External dependencies (loaded separately)
  external: [],
};

/**
 * Build the frontend
 */
async function build() {
  try {
    console.log(`\n🔨 Building frontend (${isDev ? 'development' : 'production'} mode)...\n`);

    if (isWatch) {
      // Watch mode: rebuild on changes
      const ctx = await esbuild.context(buildConfig);
      await ctx.watch();
      console.log('👀 Watching for changes...\n');
    } else {
      // One-time build
      const result = await esbuild.build(buildConfig);
      console.log(`✅ Frontend built successfully!\n`);

      // Show output files
      if (result.metafile) {
        console.log('📦 Output files:');
        for (const [file, info] of Object.entries(result.metafile.outputs)) {
          const sizeKB = (info.bytes / 1024).toFixed(2);
          console.log(`   ${file} (${sizeKB} KB)`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
await build();
