#!/usr/bin/env node

/**
 * Post-build script: Add .js extensions to imports
 *
 * TypeScript doesn't add .js extensions to ESM imports.
 * tsc-alias handles path aliases but misses some cases.
 * This script ensures all local imports have .js extensions.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

/**
 * Process a single file
 */
async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  let modified = content;

  // Fix relative imports without .js extension
  // Match: from './file' or from '../dir/file'
  // Don't match: from 'package' or from '@alias/file'
  modified = modified.replaceAll(/from\s+(['"])(\.[^'"]+)(?<!\.js)\1/g, (match, quote, path) => {
    // Skip if already has extension
    if (extname(path)) return match;
    return `from ${quote}${path}.js${quote}`;
  });

  // Fix dynamic imports
  modified = modified.replace(/import\((['"])(\.[^'"]+)(?<!\.js)\1\)/g, (match, quote, path) => {
    if (extname(path)) return match;
    return `import(${quote}${path}.js${quote})`;
  });

  // Only write if changed
  if (modified !== content) {
    await writeFile(filePath, modified, 'utf-8');
    console.log(`✓ Fixed imports in ${filePath.replace(distDir, 'dist')}`);
  }
}

/**
 * Recursively process directory
 */
async function processDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      await processFile(fullPath);
    }
  }
}

// Main execution
console.log('📝 Adding .js extensions to imports...');
await processDir(distDir);
console.log('✅ Import extensions fixed!');
