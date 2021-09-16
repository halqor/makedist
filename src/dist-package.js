/*
Creates a copy of package.json for distribution.
*/
import fs from 'fs';
import path from 'path';

function rewrite(pkg, out) {
    const distpkg = {};

    ['name', 'version', 'license', 'homepage', 'author', 'contributors', 'type', 'main', 'bin', 'dependencies', 'engines'].forEach((item) => {
        if (pkg[item]) {
            distpkg[item] = pkg[item];
        }
    });

    if (pkg.scripts) {
        distpkg.scripts = {};
        ['start'].forEach((item) => {
            if (pkg.scripts[item]) {
                distpkg.scripts[item] = pkg.scripts[item];
            }
        });
    }

    const output = JSON.stringify(distpkg, null, 2);

    if (!fs.existsSync(out)) {
        fs.mkdirSync(out, { recursive: true });
    }

    const outputFile = [out, 'package.json'].join(path.sep);
    fs.writeFileSync(outputFile, output);
}

export default rewrite;
