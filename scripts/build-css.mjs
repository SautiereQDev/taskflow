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
  console.log('🎨 Building Tailwind CSS + DaisyUI with PostCSS...');

  if (!existsSync(INPUT)) {
    throw new Error(`Input not found: ${INPUT}`);
  }

  // Use PostCSS with Tailwind config to include DaisyUI
  const cmd = `npx postcss ${INPUT} -o ${OUTPUT} ${IS_PROD ? '--env production' : ''}`;
  console.log(`📦 ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stderr && !stderr.includes('Done') && !stderr.includes('Compiled'))
      console.warn('⚠️', stderr);
    if (stdout) console.log(stdout);

    if (existsSync(OUTPUT)) {
      const content = readFileSync(OUTPUT, 'utf-8');
      const size = (content.length / 1024).toFixed(2);

      // Verify DaisyUI classes are present
      const hasDaisyUI = content.includes('.btn') || content.includes('daisyUI');
      console.log(`✅ Built successfully! Size: ${size} KB`);
      if (hasDaisyUI) {
        console.log('✅ DaisyUI classes detected');
      } else {
        console.warn('⚠️  DaisyUI classes not found - check configuration');
      }
    }
  } catch (err) {
    console.error('❌ Build failed:', err.message);
    process.exit(1);
  }
}

await build();
