/**
 * Copy Static Assets Post-Build
 *
 * Ensures production build has access to SSR templates, localisation files,
 * and pre-built frontend assets. Run after TypeScript compilation.
 */
import { cp, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const ASSET_DIRECTORIES = ['public', 'views', 'locales'];

async function ensureDist() {
  await mkdir(DIST_DIR, { recursive: true });
}

async function copyDirectory(name) {
  const source = path.join(ROOT_DIR, name);
  const destination = path.join(DIST_DIR, name);

  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
}

async function run() {
  console.log('📁 Copying static assets to dist...');
  await ensureDist();

  await Promise.all(
    ASSET_DIRECTORIES.map(async (dir) => {
      try {
        await copyDirectory(dir);
        console.log(`   • ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to copy ${dir}:`, error.message);
        throw error;
      }
    })
  );

  console.log('✅ Static assets ready in dist/');
}

run().catch((error) => {
  console.error('❌ copy-static-assets failed', error);
  process.exit(1);
});
