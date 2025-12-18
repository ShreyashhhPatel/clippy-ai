#!/usr/bin/env node
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const name = process.argv[2];

if (!name) {
  console.log('❌ Usage: mise run new-component -- ComponentName');
  process.exit(1);
}

const file = join('renderer/src/components', `${name}.jsx`);

if (existsSync(file)) {
  console.log(`❌ Component ${name} already exists!`);
  process.exit(1);
}

const template = `import { motion } from 'framer-motion';

function ${name}() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className=""
    >
      <h2>${name}</h2>
    </motion.div>
  );
}

export default ${name};
`;

writeFileSync(file, template);
console.log(`✅ Created component: ${file}`);







