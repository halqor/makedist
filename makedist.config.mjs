import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const thisFilePath = fileURLToPath(import.meta.url);
const packageJsonFile = path.resolve(path.dirname(thisFilePath), 'package.json');
const packageJsonFileContent = fs.readFileSync(packageJsonFile, 'utf-8');
const pkg = JSON.parse(packageJsonFileContent);

let packageName = pkg.name ?? 'unknown';
if (pkg.name.indexOf('/') > -1) {
    [, packageName] = pkg.name.split('/');
}
let packageVersion = pkg.version ?? '0.0.0';

const name = `${packageName}-${packageVersion}`;

const preset = 'script';

export { name, preset };
