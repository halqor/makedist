#!/usr/bin/env node

/*
Ensure the `dist` directory is empty before we package the agent.
*/
import child_process from 'child_process';
import fs from 'fs';
import clean from './dist-clean.js';
import copy from './dist-files.js';
import rewrite from './dist-package.js';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import packageInfo from './packageInfo.js';
import zip from './dist-zip.js';

let verbose = false;

function log(msg) {
    if (verbose && typeof msg === 'string') {
        process.stdout.write(msg);
        process.stdout.write('\n');
    }
}

async function main() {
    const { argv } = yargs(process.argv.slice(2))
        .scriptName('makedist')
        .option('out', {
            describe: 'path to output directory',
            type: 'string',
            default: 'makedist',
            requiresArg: true,
            global: true,
        })
        .option('name', {
            describe: 'name of output package inside output directory',
            type: 'string',
            default: 'package',
            requiresArg: true,
            global: true,
        })
        .option('src', {
            describe: 'path to source directory',
            type: 'string',
            default: '.',
            requiresArg: true,
            global: true,
        })
        .option('verbose', {
            alias: 'v',
            describe: 'verbose output',
            type: 'boolean',
            default: false,
            global: true,
        })
        .version(false) // necessary so we can implement our own --version option, instead of yargs built-in
        .option('version', {
            describe: 'display version',
            type: 'boolean',
            default: false,
            global: true,
        })
        .showHelpOnFail(false, 'Specify --help for available options')
        .strict();

    verbose = argv.verbose;

    if (argv.version) {
        const thisFilePath = fileURLToPath(import.meta.url);
        const targetPath = path.resolve(path.dirname(thisFilePath), '..'); // find package.json relative to this file's directory
        const pkg = packageInfo(targetPath);
        process.stdout.write(`${pkg.version}\n`);
        process.exit(0);
    }

    let pkg;

    log('reading package.json...');
    try {
        pkg = packageInfo(argv.src);
    } catch (err) {
        console.error('reading package.json failed', err);
        process.exit(1);
    }
    
    log('cleaning...');
    try {
        clean(argv.out);
        // postcondition: argv.out does not exist
    } catch (err) {
        console.error('cleaning failed', err);
        process.exit(1);
    }
    
    const outputdir = path.resolve(argv.out, argv.name);
    
    log('creating package directory...');
    try {
        if (!fs.existsSync(outputdir)) {
            fs.mkdirSync(outputdir, { recursive: true });
        }       
    } catch (err) {
        console.error('mkdir failed', err);
        process.exit(1);
    }
    
    log('copying files...');
    try {
        // we might be looking in a directory other than current directory,
        // and the `files` section of package.json is relative to the directory
        // where package.json file is located
        const files = pkg.files ?? [];
        await copy(files.map((item) => path.resolve(argv.src, item)), outputdir);
    } catch (err) {
        console.error('copy failed', err);
        process.exit(1);
    }
    
    log('generating package.json...');
    try {
        rewrite(pkg, outputdir);
    } catch (err) {
        console.error('generating package.json failed', err);
        process.exit(1);
    }
    
    log('npm install...');
    
    let npm;
    switch (os.platform()) {
    case 'win32':
        npm = 'npm.cmd';
        break;
    default:
        npm = 'npm';
        break;
    }
    
    const npmresult = child_process.spawnSync(npm, ['install'], { cwd: outputdir });
    if (npmresult.status === 0) {
        log(npmresult.stdout);
    } else {
        log(`npm failed with status ${npmresult.status}`);
        log(npmresult.stderr);
        process.exit(1);
    }
    
    log('archiving...');
    try {
        const outfile = [argv.out, `${argv.name}.tgz`].join(path.sep);
    
        zip(argv.out, outfile, argv.verbose);
    
        process.stdout.write(`${outfile}\n`);
    } catch (err) {
        console.error('archiving failed', err);
        process.exit(1);
    }
}

main();
