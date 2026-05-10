import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 実行ディレクトリを基準にする
const targetFile = path.resolve(process.cwd(), 'frontend/node_modules/vite/dist/node/chunks/node.js');

console.log('Target file:', targetFile);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('socket.destroySoon()')) {
    console.log('Found socket.destroySoon(), patching to socket.destroy()...');
    content = content.replace(/socket\.destroySoon\(\)/g, 'socket.destroy()');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched Vite proxy code.');
  } else {
    console.log('socket.destroySoon() not found or already patched.');
  }
} else {
  console.error('Target file not found!');
}
