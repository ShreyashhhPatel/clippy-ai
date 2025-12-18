#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];

if (!name) {
  console.log('❌ Usage: mise run new-store -- storeName');
  process.exit(1);
}

const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
const file = join('renderer/src/store', `${name}Store.js`);

if (existsSync(file)) {
  console.log(`❌ Store ${name} already exists!`);
  process.exit(1);
}

const template = `import { create } from 'zustand';

export const use${capitalized}Store = create((set, get) => ({
  // State
  data: null,
  isLoading: false,
  error: null,

  // Actions
  setData: (data) => set({ data }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({ data: null, isLoading: false, error: null }),
}));
`;

writeFileSync(file, template);
console.log(`✅ Created store: ${file}`);







