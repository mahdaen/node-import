**Node Import**
---

Before I write this, I just think if I can concatenate my scripts with direct import in each file.
But when I thinking how to do that, I think I need to create script that can concatenate and run it,
as well supporting synchronus mode without headache.

By default, imported scripts executed in synchronus mode, since for async purpose nodejs already have it,
even we have **`async`** module.

We know that asynchronus evented I/O model is the benefits of nodejs. But sometimes, probably we need to runs
synchronus scripts, especially when we create some modules and we need to separate the files but we need
to ensure each files can communicate with each others, including the global variables in each files.

Now, you can export the scripts and run it in browser. I mean if you only need to concatenate files
and minify them but still needs namespace for each file. ;)

Find usage samples in [here](http://notes.mahdaen.name)

***
**Is it usefull?**
```javascript
// Import another files.
'@import foo.js';
'@import config';

// Read variable from other files.
console.log(foo.title);

// Create namespace.
'@namespace bar';

// This variable will available in the namespace => bar.tilte.
var title = 'Title of Bar';
```

***
### **`Installation`**
---
```
npm install --save node-import
```

To use the CLI support, install it globally.

```
npm install -g node-import
```

---
After installing the module, you can load the module in the main file of your script. Module will available in
**`global`** object.

**Example**
```js
// Load node-import without wrapping to variable.
require('node-import');

// After node-import loaded, all methods will available in global scope.
include('foo');
imports('bar/main');
```

***
### **`include()`**

Include **`modules`** from outside **`node_modules`** folder. Since the default **`require()`** is only 
access the **`node_modules`** folder, **`include()`** will help us to require modules or json from any folder.
It's works like **`require()`**. You can install NPM Packages outside of **`node_modules`** folder by
using **`node-import -i`**.

**Usage**
```javascript
var foo = include(SCRIPTS);
```

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| SCRIPTS | `String` | String module name, folder name, or js/json filename. |

***
**Example**

- **root**
	 - **people**
	    - **`index.js`**
	 - **team**
	    - **support**
	        - **`main.js`**
	        - **`package.json`**
	    - **`team.js`**
	 - **`index.js`**
	 
```javascript
// Load the node-import first.
require('node-import');

// Include people.
var people = include('people');     // Valid

// Equal with
var people = require('./people/index.js');

// Other
var team = include('team');         // Valid
var index = include('index');       // Valid

// Include package. It's valid with `main` property defined.
var support = include('support');   // In package.json, `main` property referenced to `main.js`
```

***
### **`imports()`**

Import/Export scripts.
You can load scripts from file and run it to global scope.
All variables in the scripts will available to another scripts.
Imports will always run the scripts in global scope, so using it in the **`module.exports = `** block sometimes will not works properly.
NodeImport provide **`$root`** pattern to add root folder to the filename.

**Usage**
```javascript
var script = imports(FILES, OPTIONS);
```

**Returns: `script object`**

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| FILES | `String` or `Array` | Script filename or array filename lists. You can ignore the file extension. Add `$root` in the filename as root folder. |
| OPTIONS `optional` | `Object` | Object contains the import options. |

---
**Options**

Remember, options name is case-sencitive.

| **Name** | **Type** | **Default** | **Description** |
| -------- | -------- | ----------- | --------------- |
| exec | `Boolean` | `true` | Run the imported scripts or not. |
| async | `Boolean` | `false` | Run the imported scripts in `async` mode or not. |
| export | `Boolean` | `false` | Export the imported scripts to file or not. |
| exportDir | `String` | `null` | Folder location to save the imported scripts. |
| exportMin | `Boolean` | `true` | Also save the minified version when exporting scripts. |
| exportMap | `Boolean` | `true` | Also save the sourcemap file when exporting scripts. |

---
**Example**
```javascript
// Load the node-import first.
require('node-import');

// Imports foo.js file and run it.
var foo = imports('foo/main');

// Re-run the imported scripts.
foo.run();

// Print the imported scripts.
console.log(foo.text);

// Only export the scripts.
imports('foo/extra', { exec: false, export: true, exportDir: 'test/out' });
```

***
### **`imports.module()`**

Import scripts inside **`module.exports`** block. The difference with **`imports()`** is the scripts will be
evaluated when the module is used. While **`imports()`** is evaluated directly into global scope.

Imported scripts using **`import.module()`** will be evaluated in the **`node-import`** scope, so it's safe.
The benefit is the result will contains all global variables in the imported scripts. While **`require()`** will only
contains exported module.

**Usage**
```javascript
var result = imports(FILES, SHARED_VARIABLES);
```

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| FILES | `String` or `Array` | Script filename or array filename lists. You can ignore the file extension. |
| SHARED_VARIABLES `optional` | `Object` | Object contains variables to share with imported scripts. |

---
**Example**
```js
// Load node-import first.
require('node-import');

module.expors = function(param) {
	// Importing foo.js and share parameters with imported scripts.
	var foo = imports.module('foo/main', { shared: param });
	
	// foo contains the global variables from foo.js
	console.log(foo.title);
	console.log(foo.description);
};
```

**`foo/main.js`**

```js
// Create variables to share to result.
var title = 'Foo title';
var description = 'The foo is a non-bar string and always be foo';

// Read the shared variables from the importer.
console.log(shared);
```

***
### **`@import`**

This is pattern to import another scripts and require to be loaded by **`imports()`** or **`imports.module()`**.
The pattern options will follow the **`imports()`** or **`imports.module()`** options.

**Usage**

The pattern must be defined using string. Like when we use **`'use strict';`**.

```javascript
'@import [FILES ...]';

// Do something with imported scripts.
```

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| FILES | `String` | File name with extension, file name without extension, folder name or comma separated file names. |

---
**Example**

**`test.js`**
```js
// Load node-import first.
require('node-import');

// Importing importing lib-a.js using imports() since pattern wont works without this importer in the main script.
imports('libs/lib-a');

// Access the variables from imported scripts.
console.log(title); // > Title from lib-a.js
console.log(description); // > Description from lib-a.js

// Replace the title
title = 'Replaced title';

// Print the title
console.log(title); // > Replaced title
```

**`libs/lib-a.js`**
```js
// Import another file at begining.
'@import lib-b.js';

// Create variables to share it.
var title = 'Title from lib-a.js';
var description = 'Description from lib-a.js';

// Import is not always at begining, and relative to the last working directory.
'@import lib-c.js';

// Imports multiple files with comma separated.
'@import libs/lib-d.js, libs/lib-e.js';

// Import without file extension.
'@import libs/code'; // If folder contains code.a.js or code.b.js it's will be imported as well.

// Import all files inside folder. *.js is important!
'@import libs/configs/*.js';
```

***
### **`@namespace`**

Namespace is pattern to makes the variables in the imported file will available as **`public`** and **`private`**.
It's mean when you have variables with same name, variable inside the namespace will not replaced by next changes.

**Usage**
```javascript
'@namespace NAME';

// Do anythings.
```

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| NAME | `String` | Namespace name. It's will be used when you access the namespace. |

---
**Example**
```javascript
// Importing namespaces.
'@import foo';
'@import bar';

// The public title is title of bar since title from foo is replaced by title from bar.
console.log(title); // > Title of Bar.

// Print the title of foo. Since it's in namespace, it wont be replaced by title from bar.
console.log(foo.title); // Title of Foo

// Print the title of bar.
console.log(bar.title); // Title of Bar.

// Print the public variables from foo and bar.
console.log(fooA, barA); // > A from foo A from Bar
```

**`foo.js`**
```javascript
'@namespace foo';

var title = 'Title of Foo';
var fooA = 'A from foo';
```

**`bar.js`**
```javascript
'@namespace bar';

var title = 'Title of Bar';
var barA = 'A from Bar';

// Saved variables is everythings that outside any block. You can define the variable with/without "var".
var barC = 'C from Bar'; // Saved to namespace.

barD = 'D from Bar'; // Saved to namespace.

var barE = 'E from Bar', barF = 'F from Bar'; // Saved to namespace.

function bars() {
    var barG = 'Bar in function'; // Not saved to namespace.
}

if ('undefined' === typeof global) {
    var barH = 'Bar in block'; // Not saved to namespace.
}
```

***
### **`node-import` CLI**

Use node-import in the command line.

**Usage**
```
node-import [options] [file ..]
```

---
**options**
- `-r` Run imported scripts. Default `false`
- `-a` Run in async mode. Default `false`
- `-e` Export imported scripts. Default `false`
- `-u` Include uglify when exporting scripts. Default `false`
- `-s` Include sourcemap when uglifying. Default `false`
- `-o` Output directory to export.
- `-n` Mark as non-javascript files. Default `false`.
- `-b` Beautify scripts. Default `true`.
- `-v` Logs all processes.
- `-h` Show helps.

**Example**
###### **Run**
```
$ node-import -r test/index.js 
```

---
###### **Export**
```
$ node-import -e -o test/out test/index.js
```

***
### **`node-import -i` CLI**

Install NPM packages to any folder, not just **`node_modules`**.
Since we already have the **`include()`** above, then installing packages outside **`node_modules`**
folder is fine.

**Usage**

You can install packages anywhere. If you want to install multiple packages in multiple collection, you can
write **`imports.json`** file before running install. 

```
node-import -i [PACKAGES] (-o) (--save)
```

---
**Params**

| **Name** | **Type** | **Description** |
| -------- | -------- | --------------- |
| PACKAGES | `String` | String package name to install. You can install multiple packages by separate them using space. |
| o `optional` | `String` | String output dir name or collection name.
| SAVE `optional` | `Boolean` | Save the installed package to **`imports.json`** if not already exists and append if already exists.

---
**Example**

**`imports.json`**
```json
{
	"default": {
		"packages": ["short-sass", "native-js"],
		"location: "libraries/"
	},
	"corelibs": {
		"packages": ["express", "async"],
		"location": "corelibs"
	}
}
```

```shell

# Install all packages in imports.json
node-import -i

# Install and add the installed packages to imports.json. If imports.json not exists, it's will be created.
node-import -i short-sass grunt-export --save

# Custom installation dir, not using the location in imports()
node-import -i short-sass native-js -o core-sys/libs --save

# Add new package to "corelibs" collection.
node-import -i domlist -o corelibs --save
```


***
### **`NOTES`**
More examples available in **`test/`** folder.
To test it, install the module, cd to the module folder and run **`npm test`**

To concat non-javascript files, add **`noscript`** options and set **`beautify`** to false in options.
If you want to beautify the non-javascript files, you can define custom formatter by adding **`formatter`** in options.
Formatter should be a javascript function.

***
### **`Limitation`**

* Currently we don't support importing minified javascripts.
* Namespace only read global variables in imported scripts. Namespace also only available for javascript.
* `imports()` run script in `global` context.
* `imports.module()` only share variable in the import result.
* `include()` is just like `require()`, no sharable object in the result.

***
### **`Release History`**

* 2015-05-10        v0.9.2      "Fixing files and directory resolver issues."
* 2015-03-30        v0.9.1      "Updating Readme."
* 2015-03-30        v0.9.0      "Adding support to concat non-javascript files."
* 2015-03-26        v0.8.0      "Adding structural install options."
* 2015-03-24        v0.7.3      "Fixing default location property name."
* 2015-03-24        v0.7.2      "Fixing error when no imports.json file in the cwd."
* 2015-03-23        v0.7.1      "Updating readme."
* 2015-03-22        v0.7.0      "Adding CLI package installer."
* 2015-03-22        v0.6.1      "Improving Readme"
* 2015-03-08        v0.6.0      "Adding include() module"
* 2015-03-05        v0.5.0      "Fixing namespace and add return variables as object for imports.module()"
* 2015-03-05        v0.4.1      "Fixing source-map sources url mistake."
* 2015-03-05        v0.4.0      "Adding support to import scripts by call it inside a module."
* 2015-03-05        v0.3.1      "Fixing namespace conflict when using null-extension."
* 2015-03-05        v0.3.0      "Adding support to ignore file extension using plain object as namespace."
* 2015-02-26        v0.2.1      "Fixing error defining root"
* 2015-02-26        v0.2.0      "Adding namespace constructor to each converted js, to makes namespacing available in browser."
* 2015-02-26        v0.1.9      "Adding $root pattern to define as root cwd."
* 2015-02-25        v0.1.8      "Changing execution context, Fixing Uglify and Sourcemap issue and modifying CLI methods."
* 2015-02-25        v0.1.7      "Adding js-beautify."
* 2015-02-25        v0.1.6      "Fixing namespace and async orders."
* 2015-02-24        v0.1.5      "Fixing bugs with no-exec."
* 2015-02-24        v0.1.4      "Updating namespace variable getter"
* 2015-02-21        v0.1.3      "Fixing mistakes with `async` option."
* 2015-02-21        v0.1.2      "Adding namespace support."
* 2015-02-21        v0.1.1      "First release."