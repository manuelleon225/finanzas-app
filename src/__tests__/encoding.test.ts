import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const DIRS = ['src', 'docs', 'supabase'];

const BROKEN = new RegExp(
  '\\uFFFD|\\u00C3[\\u00B3\\u00A9\\u00B1\\u00A1\\u00BA\\u00AD]|\\u00C2',
  'g',
);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

describe('codificación UTF-8', () => {
  it('todos los archivos de texto son UTF-8 válido y sin caracteres rotos', () => {
    const issues: string[] = [];
    for (const relative of DIRS) {
      const base = path.join(ROOT, relative);
      if (!fs.existsSync(base)) {
        continue;
      }
      for (const file of walk(base)) {
        const buffer = fs.readFileSync(file);
        let text: string;
        try {
          text = buffer.toString('utf8');
        } catch {
          issues.push(`${file}: no es UTF-8 válido`);
          continue;
        }
        if (Buffer.from(text, 'utf8').toString('hex') !== buffer.toString('hex')) {
          issues.push(`${file}: no es UTF-8 válido`);
          continue;
        }
        const matches = text.match(BROKEN);
        if (matches) {
          issues.push(`${file}: ${matches.length} carácter(es) roto(s)`);
        }
      }
    }
    if (issues.length > 0) {
      throw new Error(issues.join('\n'));
    }
  });
});
