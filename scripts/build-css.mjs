/**
 * CSS Build Script - Tailwind CSS 4 + DaisyUI
 */
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IS_PROD = process.env.NODE_ENV === 'production';
const INPUT = path.join(__dirname, '../public/css/tailwind.css');
const OUTPUT = path.join(__dirname, '../public/css/output.css');

async function build() {
  console.log('🎨 Building Tailwind CSS 4 + DaisyUI...');

  if (!existsSync(INPUT)) {
    throw new Error(`Input not found: ${INPUT}`);
  }

  const cmd = `npx tailwindcss -i ${INPUT} -o ${OUTPUT} ${IS_PROD ? '--minify' : ''}`;
  console.log(`📦 ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr && !stderr.includes('Done')) console.warn('⚠️', stderr);
    if (stdout) console.log(stdout);

    if (existsSync(OUTPUT)) {
      const size = (readFileSync(OUTPUT, 'utf-8').length / 1024).toFixed(2);
      console.log(`✅ Built successfully! Size: ${size} KB`);
    }
  } catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  }
}

build();
