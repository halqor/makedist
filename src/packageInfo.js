import fs from 'fs';
import path from 'path';

function packageInfo(targetPath = '.') {
    const packageJsonFile = path.resolve(targetPath, 'package.json');
    const packageJson = fs.readFileSync(packageJsonFile, 'utf-8');
    return JSON.parse(packageJson);
}

export default packageInfo;
