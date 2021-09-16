Makedist
========

Makedist helps developers and administrators prepare a package containing their
source code or distributable binary.

It's written in JavaScript but is intended for (eventually) helping to package anything.

Currently on JavaScript projects with `package.json` are supported.

# Installation

To install Makedist:

```sh
npm install -g makedist
```

# Usage

To package a NodeJS project with only production dependencies:

```sh
cd project_dir
makedist
```

When successful, the output is a single line with the path to the
output file. For example:

```sh
makedist/package.tgz
```

## Change source directory

Instead of looking for `package.json` in the current directory, you
can look in another directory:

```sh
makedist --src /path/to/project_dir
```

## Change output directory

Instead of creating an output directory `./makedist`, you can
choose any other location instead:

```sh
makedist --out /tmp/makedist
```

## Change package file name

Instead of creating an output file `package.tgz` in the output directory,
you can name it whatever you like:

```sh
makedist --name example.tgz
```

## Select preset

The `files` and `packageInfo` options aren't available directly via the command
line, but there are a few presets you can select for these.

For example:

```sh
makedist --preset script
makedist --preset library
makedist --preset website
```

### library

Sets the `dependencies` option to true (unless you override it with `--no-dependencies`).

Includes `dependencies`, `type`, `main`, and `engines` top-level properties from `package.json`.

### script

Sets the `dependencies` option to true (unless you override it with `--no-dependencies`).

Includes `dependencies`, `type`, `bin`, and `engines` top-level properties from `package.json`.

### website

Sets the `dependencies` option to false (unless you override it with `--dependencies`).

Does not include additional top-level properties from `package.json`.

## Show verbose messages

If you need to see more details about what is happening, use the
verbose flag:

```sh
makedist --verbose
makedist -v
```

# Configuration

When an option can be defined in multiple places, the following priority order is used:

1. Command line arguments (override configuration)
2. Export from `makedist.config.mjs` or `makedist.config.cjs` (can actually read `makedist` from package.json and then override it)
3. Content of `package.json` in the 'makedist' section
4. Built-in defaults (package name is 'package', output directory is 'makedist')

However, not all settings can be defined in all these places.

The following options can ONLY be set via the command line:

* `--src`
* `--verbose` or `-v`

The following options can ONLY be set via the configuration file:

* `files` (which files to copy into the package; overrides the top-level `files` section from `package.json`)
* `packageInfo` (which top-level attributes of `package.json` to copy into the package)

## makedist.config.js

Makedist looks for a file named `makedist.config.mjs` or `makedist.config.cjs`
or `makedist.config.js` in the source directory, in that order.
Only the first one found is imported.

If you use `makedist.config.js`, the content can be ESM or CommonJS, and MUST
match your project settings in `package.json` (default is CommonJS if not specified).

The file should export the configuration settings that should be set.

You can export static values, or you can run some JavaScript code before exporting.

Here is an example `makedist.config.mjs` that sets a static package name:

```js
const name = 'makedist';
export { name };
```

Here is the same functionality but in 'makedist.config.cjs`:

```js
const name = 'makedist';
module.exports = { name };
```

Here is an example `makedist.config.mjs` that sets a dynamic package name based on
the name and version fields in `package.json`:

```js
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

export { name };
```

Here is the same functionality but in `makedist.config.cjs`:

```js
const fs = require('fs');
const path = require('path');

const packageJsonFile = path.resolve(path.dirname(__filename), 'package.json');
const packageJsonFileContent = fs.readFileSync(packageJsonFile, 'utf-8');
const pkg = JSON.parse(packageJsonFileContent);

let packageName = pkg.name ?? 'unknown';
if (pkg.name.indexOf('/') > -1) {
    [, packageName] = pkg.name.split('/');
}
let packageVersion = pkg.version ?? '0.0.0';

const name = `${packageName}-${packageVersion}`;

module.exports = { name };
```

## package.json

Here is an example `package.json` that sets a static package name:

```json
{
    "name": "@halqor/makedist",
    "version": "0.1.2",
    "makedist": {
        "name": "makedist-0.1.2"
    }
}
```

# Project types

## NodeJS

By default, `makedist` will create a `makedist/package` directory containing a
copy of each file and directory mentioned in the `files` section of
`package.json`, and also a `makedist/package/node_modules` directory containing
only the packages mentioned in the `dependencies` section of
`package.json` (and not in the `devDependencies`), then it will
create an output file `makedist/package.tgz` with the content of the `makedist/package` directory.
