import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace any Supabase-hosted image URL with the local logo asset
const OLD_URL_REGEX = /['"]https:\/\/.*\.db\.co\/storage\/v1\/object\/public\/genudo-platform-visuals\/.*\.png['"]/g;
const NEW_URL = "'/genudo-main-logo.png'";

const TARGET_COMPONENTS = [
    path.join(__dirname, 'src', 'components', 'layout', 'ModernLayout.tsx'),
    path.join(__dirname, 'src', 'components', 'layout', 'ModernSidebar.tsx'),
    path.join(__dirname, 'src', 'components', 'layout', 'Header.tsx'),
    path.join(__dirname, 'src', 'main.tsx'),
    path.join(__dirname, 'src', 'App.tsx'),
];

console.log('--- STARTING LOGO FIX ---');

for (const filePath of TARGET_COMPONENTS) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        if (OLD_URL_REGEX.test(content)) {
            content = content.replace(OLD_URL_REGEX, NEW_URL);
            fs.writeFileSync(filePath, content, 'utf8');
            changed = true;
            console.log(`FIXED: ${path.basename(filePath)}`);
        }
    }
}

console.log('--- LOGO FIX COMPLETE ---');