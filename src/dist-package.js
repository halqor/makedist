/*
Creates a copy of package.json for distribution.
*/
import fs from 'fs';
import path from 'path';

function rewrite(pkg, packageInfo = [], out) {
    const distpkg = {};
  
    packageInfo.forEach((item) => {
        if (pkg[item]) {
            distpkg[item] = pkg[item];
        }
    });

    const output = JSON.stringify(distpkg, null, 2);

    if (!fs.existsSync(out)) {
        fs.mkdirSync(out, { recursive: true });
    }

    const outputFile = [out, 'package.json'].join(path.sep);
    fs.writeFileSync(outputFile, output);
}

export default rewrite;
