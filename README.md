Makedist
========

Makedist helps developers and administrators prepare a package containing their
source code or distributable binary.

It's written in JavaScript but is intended for (eventually) helping to package anything.

Currently on JavaScript projects with `package.json` are supported.

# Installation

To install Makedist:

```
npm install -g makedist
```

# Usage

To package a NodeJS project with only production dependencies:

```
cd project_dir
makedist
```

When successful, the output is a single line with the path to the
output file. For example:

```
makedist/package.tgz
```

## Change source directory

Instead of looking for `package.json` in the current directory, you
can look in another directory:

```
makedist --src /path/to/project_dir
```

## Change output directory

Instead of creating an output directory `./makedist`, you can
choose any other location instead:

```
makedist --out /tmp/makedist
```

## Change package file name

Instead of creating an output file `package.tgz` in the output directory,
you can name it whatever you like:

```
makedist --name example.tgz
```

## Show verbose messages

If you need to see more details about what is happening, use the
verbose flag:

```
makedist --verbose
makedist -v
```

# Project types

## NodeJS

By default, `makedist` will create a `makedist/package` directory containing a
copy of each file and directory mentioned in the `files` section of
`package.json`, and also a `makedist/package/node_modules` directory containing
only the packages mentioned in the `dependencies` section of
`package.json` (and not in the `devDependencies`), then it will
create an output file `makedist/package.tgz` with the content of the `makedist/package` directory.
