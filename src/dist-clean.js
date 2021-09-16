import fs from 'fs';

/*
Ensure the target directory is empty
*/
function clean(target) {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
    }
}

export default clean;
