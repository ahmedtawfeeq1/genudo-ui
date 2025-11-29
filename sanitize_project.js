import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const TARGET_DIR = path.join(__dirname, 'src');
const OLD_IMPORT = '@/integrations/supabase/client';
const NEW_IMPORT = '@/lib/mock-db';
const OLD_VAR = 'supabase';
const NEW_VAR = 'db';

function sanitizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace the Import Statement
  // Matches: import { supabase } from "@/integrations/supabase/client";
  const importRegex = /import\s+\{\s*supabase\s*\}\s+from\s+['"]@\/integrations\/supabase\/client['"];?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, `import { ${NEW_VAR} } from "${NEW_IMPORT}";`);
    changed = true;
  }

  // 2. Replace the Usage
  // Matches: supabase.from(...) -> db.from(...)
  // We use a regex that looks for 'supabase' as a whole word to avoid replacing 'supabase-js' string literals
  const usageRegex = /\bsupabase\./g;
  if (usageRegex.test(content)) {
    content = content.replace(usageRegex, `${NEW_VAR}.`);
    changed = true;
  }
  
  // 3. Remove Supabase Types imports (Optional, often causes errors in detached mode)
  // Matches: import ... from "@/integrations/supabase/types";
  const typesRegex = /import\s+.*from\s+['"]@\/integrations\/supabase\/types['"];?/g;
  if (typesRegex.test(content)) {
    content = content.replace(typesRegex, '// Types removed for clean export');
    changed = true;
  }

  if (changed) {
    console.log(`cleaned: ${filePath}`);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      sanitizeFile(fullPath);
    }
  }
}

console.log('--- STARTING SANITIZATION ---');
walkDir(TARGET_DIR);
console.log('--- CLEANUP COMPLETE ---');