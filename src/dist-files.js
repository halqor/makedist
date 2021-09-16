import path from 'path';
import ncpAsync from './ncp-async.js';

/*
Creates a copy of the specified files and directories.
Each entry in the `files` array is copied to the destination directory.
*/
async function copy(files = [], dst) {
    for (let i = 0; i < files.length; i += 1) {
        let target;
        try {
            target = [dst, path.basename(files[i])].join(path.sep);
            await ncpAsync(files[i], target); // eslint-disable-line no-await-in-loop
        } catch (err) {
            console.error(`failed to copy from ${files[i]} to ${target}`);
        }
    }
}

export default copy;
