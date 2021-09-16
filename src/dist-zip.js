/*
Creates a copy of package.json for distribution.
*/
import fs from 'fs';
import tar from 'tar';

function zip(src, outfile, verbose = false) {
    if (fs.existsSync(outfile)) {
        fs.rmSync(outfile);
    }

    const files = fs.readdirSync(src);
    if (verbose) {
        console.log(`files: ${JSON.stringify(files)}`);
    }

    tar.create(
        {
            gzip: true,
            file: outfile,
            cwd: src,
            sync: true,
        },
        files,
    );
}

export default zip;
