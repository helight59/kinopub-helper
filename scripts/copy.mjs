import { mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const srcRoot = join(projectRoot, 'src');
const distRoot = join(projectRoot, 'dist');

mkdirSync(distRoot, { recursive: true });

const copyFile = (fromAbs, toAbs, params) => {
  mkdirSync(dirname(toAbs), { recursive: true });
  cpSync(fromAbs, toAbs, params);
};

const copy = (rel, params) => {
  copyFile(join(srcRoot, rel), join(distRoot, rel), params);
};

const walkUiAndCopyHtml = (relDir) => {
  const absDir = join(srcRoot, relDir);
  const entries = readdirSync(absDir);

  for (const name of entries) {
    const rel = join(relDir, name);
    const abs = join(srcRoot, rel);
    const st = statSync(abs);

    if (st.isDirectory()) {
      walkUiAndCopyHtml(rel);
      continue;
    }

    if (name.toLowerCase().endsWith('.html')) {
      copy(rel);
    }
  }
};

copy('manifest.json');
copy('assets', { recursive: true });
walkUiAndCopyHtml('ui');