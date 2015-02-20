NodeJS Import
===========
Imports dependencies and run it directly or concatenate them and exports to file.
Before I write this, I just think if I can concatenate my scripts with direct import in each file.
But when I thinking how to do that, I think I need to create script that can concatenate and run it.

### **Installation**
***
```
npm install --save node-import
```

To use the CLI support, install it globally.
```
npm install -g node-import
```

### **Syntax**
***
Use the `'@import [file ..]';` to import the dependencies. It's should be string, like when you use `use strict`.

### **Example**
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

### **Usage**
#### `NodeJS`
***
`imports(files, [options (object)]);`

##### `options`
- `exec` Execute the imported scripts. Default `true`
- `sync` Execute the imported scripts in synchronus mode. Default `true`
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
