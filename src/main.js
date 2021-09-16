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

async function importESM(targetPath) {
    if (fs.existsSync(targetPath)) {
        log(`reading configuration file ${targetPath}`);
        // on windows, absolute paths to import must be file:// URLs
        if (os.platform() === 'win32') {
            targetPath = ['file://', targetPath.replaceAll('\\', '/')].join('/');
        }
        const importconf = await import(targetPath);
        log(`read configuration from file ${JSON.stringify(importconf)}`);
        return importconf;
    }
    return undefined;
}

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
            describe: 'path to output directory (default "makedist")',
            type: 'string',
            // default: 'makedist',
            requiresArg: true,
            global: true,
        })
        .option('name', {
            describe: 'name of output package inside output directory (default "package")',
            type: 'string',
            // default: 'package',
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
        .option('dependencies', {
            alias: 'dependencies',
            describe: 'include production dependencies in package (default "true")',
            type: 'boolean',
            // default: false,
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

    // look for makedist configuration file in src directory
    let importconf, packageconf;
    log('checking configuration...');
    try {
        // try to import configuration from these files in priority order
        importconf =
            await importESM(path.resolve(argv.src, 'makedist.config.mjs'))
            ?? await importESM(path.resolve(argv.src, 'makedist.config.cjs'))
            ?? await importESM(path.resolve(argv.src, 'makedist.config.js'));
    } catch (err) {
        console.error('checking configuration failed', err);
        process.exit(1);
    }

    let pkg;

    log('reading package.json...');
    try {
        pkg = packageInfo(argv.src);

        // look for makedist configuration in package.json
        if (pkg.makedist) {
            packageconf = pkg.makedist;
            log(`read configuration from package.json ${JSON.stringify(packageconf)}`);
        }
    } catch (err) {
        console.error('reading package.json failed', err);
        process.exit(1);
    }

    // start with the default configuration
    const conf = {
        name: 'package',
        out: 'makedist',
        packageInfo: ['name', 'version', 'license', 'author', 'contributors'],
    };

    // override with values from package.json
    if (packageconf) {
        ['name', 'out', 'files', 'dependencies', 'packageInfo', 'preset'].forEach((item) => {
            if (typeof packageconf[item] !== 'undefined') {
                conf[item] = packageconf[item];
            }
        });
    }

    // override with values from makedist.config.js
    if (importconf) {
        ['name', 'out', 'files', 'dependencies', 'packageInfo', 'preset'].forEach((item) => {
            if (typeof importconf[item] !== 'undefined') {
                conf[item] = importconf[item];
            }
        });
    }

    // override with command-line options
    ['name', 'out', 'dependencies', 'preset'].forEach((item) => {
        if (typeof argv[item] !== 'undefined') {
            conf[item] = argv[item];
        }
    });

    // apply presets
    if (conf.preset) {
        switch (conf.preset) {
        case 'library':
            conf.dependencies ??= true;
            conf.packageInfo ??= [];
            ['dependencies', 'type', 'main', 'engines'].forEach((item) => {
                if (!conf.packageInfo.includes(item)) {
                    conf.packageInfo.push(item);
                }
            });
            break;
        case 'script':
            conf.dependencies ??= true;
            conf.packageInfo ??= [];
            ['dependencies', 'type', 'bin', 'engines'].forEach((item) => {
                if (!conf.packageInfo.includes(item)) {
                    conf.packageInfo.push(item);
                }
            });
            break;
        case 'website':
            conf.dependencies ??= false;
            break;
        default:
            console.error(`unknown preset: ${conf.preset}`);
            process.exit(1);    
        }
    }

    log(`configuration: ${JSON.stringify(conf)}`);
    
    log('cleaning...');
    try {
        clean(conf.out);
        // postcondition: conf.out does not exist
    } catch (err) {
        console.error('cleaning failed', err);
        process.exit(1);
    }
    
    const outputdir = path.resolve(conf.out, conf.name);
    
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
        // and the `files` section of package.json (or override from config)
        // is relative to the directory where package.json file is located
        const files = conf.files ?? pkg.files ?? [];
        await copy(files.map((item) => path.resolve(argv.src, item)), outputdir);
    } catch (err) {
        console.error('copy failed', err);
        process.exit(1);
    }
    
    log('generating package.json...');
    try {
        rewrite(pkg, conf.packageInfo, outputdir);
    } catch (err) {
        console.error('generating package.json failed', err);
        process.exit(1);
    }
    
    if (conf.dependencies) {
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
    }
    
    log('archiving...');
    try {
        const outfile = [conf.out, `${conf.name}.tgz`].join(path.sep);
    
        zip(conf.out, outfile, argv.verbose);
    
        process.stdout.write(`${outfile}\n`);
    } catch (err) {
        console.error('archiving failed', err);
        process.exit(1);
    }
}

main();
