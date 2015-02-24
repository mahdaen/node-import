NodeJS Import
===========
Imports dependencies and run it directly (sync/async) or concatenate them and exports to file.

### **Why?**
***

Before I write this, I just think if I can concatenate my scripts with direct import in each file.
But when I thinking how to do that, I think I need to create script that can concatenate and run it,
as well supporting synchronus mode without headache.

By default, imported scripts executed in synchronus mode, since for async purpose nodejs already have it,
even we have `async` module.

We know that asynchronus evented I/O model is the benefits of nodejs. But sometimes, probably we need to runs
synchronus scripts, especially when we create some modules and we need to separate the files but we need
to ensure each files can communicate with each others, including the global variables in each files.

### **Installation**
***

```
npm install --save node-import
```

To use the CLI support, install it globally.
```
npm install -g node-import
```

### **Import/Export**
Import another scripts and run/export to file.

#### **Syntax**
***

Use the `'@import [file ..]';` to import the dependencies. It's should be string, like when you use `use strict`.

#### **Example**
***

##### `test.js`
```js
// Importing dependencies at begining.
'@import libs/lib-a.js';
'@import libs/lib-b.js';

var a = 'Test..';

// Create variable from file lib-a.js.
var b = libaA;

console.log(a, b);
```

##### `libs/lib-a.js`;
```js
// Create library to be used by test.js
var libA = 'Foo is bar foobar';

// Import is not always in begining, and relative to cwd of lib-a.js.
'@import lib-c.js';

// Imports multiple files.
'@import libs/lib-a.js, libs/lib-c.js';
'@import libs/*.js';
```

### **Namespace**
Namespace provide ability to keep the global variables of file is not overwritten by other references.
Namespace is limited. It's only read `global` variables and should started with new line. E.g

```js
var a = 0; // Accepted

b = 1, c = 3; // Accepted

if (a = 0) d = 3; // Ignored.
```

#### **Syntax**
***

You can define namespace by using `'@namespace $NAME$';`. Like import, it's should be string as well.

#### **Example**
***

##### `foo.js`
```js
// Importing libs.
'@import bar.js';

// Private vars.
var myfoo = 'Foo of foo.js';
var exfoo = bar.foo + myfoo;

// Global vars.
var spfoo = foobar + ' is global';
```

##### `bar.js`
```js
// Create namespace
'@namespace bar';

var foo = 'Foo of Bar';
var foobar = 'Global foobar';
```


### **Usage**
#### `NodeJS`
***

`imports(files, [options (object)]);`

##### `options`
- `exec` Execute the imported scripts. Default `true`
- `async` Execute the imported scripts in async mode. Default `false`
- `export` Export imported scripts to file. Default `false`
- `exportDir` Export location.
- `exportMin` Include minified version when exporting. Default `true`
- `exportMap` Include sourcemap when uglifying. Default `true` *(not yet tested)*

```js
var imports = require('node-import');

// Just execute.
imports('./test.js');

// Execute and get the scripts.
var result = imports('./test.js');

// Only export the scripts.
imports('./test.js', { exec: false, export: true, exportDir: './test/out' });
```

#### `CLI`
***

`node-import [options] [file ..]`

##### `options`
- `-r` Run imported scripts. Default `true`
- `-a` Run in async mode. Default `false`
- `-e` Export imported scripts. Default `false`
- `-u` Include uglify when exporting scripts. Default `true`
- `-s` Include sourcemap when uglifying. Default `true`
- `-o` Output directory to export.
- `-v` Logs all processes.
- `-h` Show helps.

```
node-import -e -o test/out test/index.js
```

## Release History
* 2015-02-21        v0.1.3      "Fixing mistakes with `async` option."
* 2015-02-21        v0.1.2      "Adding namespace support."
* 2015-02-21        v0.1.1      "First release."
