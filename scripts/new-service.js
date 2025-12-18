#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];

if (!name) {
  console.log('❌ Usage: mise run new-service -- serviceName');
  process.exit(1);
}

const file = join('renderer/src/services', `${name}Service.js`);

if (existsSync(file)) {
  console.log(`❌ Service ${name} already exists!`);
  process.exit(1);
}

const template = `/**
 * ${name} Service
 */

export async function fetchData() {
  try {
    // Implementation here
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default {
  fetchData,
};
`;

writeFileSync(file, template);
console.log(`✅ Created service: ${file}`);







