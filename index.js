/* Global Wrapper */
var $ = global;

/* Required Modules */
var pc = process;
var fs = require('fs');
var fe = require('fs-extra');
var gl = require('glob');
var pt = require('path');
var ug = require('uglify-js');
var cl = require('colors/safe');
var bt = require('js-beautify').js_beautify;

var $r = process.cwd();

/* Main Importer */
var Imports = function (source, options, verbose) {
    /* Single file import */
    if ( 'string' == typeof source ) {
        return imports(source, options, verbose);
    }

    /* Multiple files import */
    else if ( 'object' == typeof source ) {
        /* Creating scripts holder */
        var scripts = '', result;

        /* Files in array */
        if ( Array.isArray(source) ) {
            source.forEach(function (file, i) {
                var scr = imports(file, options, verbose);

                if ( scr ) {
                    scripts += scr.text;

                    if ( i == 0 ) {
                        result = scr;
                    }
                }
            });

            if ( result ) {
                return result;
            }
        }

        /* Files in object */
        else {
            var start = 0;

            source.forEach(function (file, options) {
                var scr = imports(file, options, verbose);

                if ( scr ) {
                    scripts += scr.text;

                    if ( start == 0 ) {
                        result = scr;
                    }
                }

                start++;
            });

            if ( result ) {
                return result;
            }
        }
    }
}

/* Import Wrapper */
Imports.module = function (source, params, verbose) {
    var script = imports(source, { exec : false }, verbose);

    if ( 'object' == typeof params && !params.length ) {
        for ( var key in params ) {
            if ( params.hasOwnProperty(key) ) {
                eval('var ' + key + ' = params[key];');
            }
        }
    }

    if ( script ) {
        eval(script.get());

        var text = script.text, exports = new Namespace('node-import');

        /* Getting global variable lists */
        var txsplit = text.split(/[\r\n]+/), variables = [];

        txsplit.forEach(function (line) {
            var hasvar = line.match(/^var\s+[a-zA-Z\d\_\$]+\s?\=/g);

            if ( hasvar ) {
                hasvar.forEach(function (vars) {
                    variables.push(vars);
                });

                var invar = line.match(/\,\s+[a-zA-Z\d\_\$]+\s?\=/g);

                if ( invar ) {
                    invar.forEach(function (vars) {
                        variables.push(vars);
                    });
                }
            }

            else {
                hasvar = line.match(/^[a-zA-Z\d\_\$]+\s?\=/g);

                if ( hasvar ) {
                    hasvar.forEach(function (vars) {
                        variables.push(vars);
                    });

                    var invar = line.match(/\,\s+[a-zA-Z\d\_\$]+\s?\=/g);

                    if ( invar ) {
                        invar.forEach(function (vars) {
                            variables.push(vars);
                        });
                    }
                }
            }
        });

        if ( variables ) {
            /* Registering global variables */
            variables.forEach(function (vars) {
                vars = vars.replace(/var?\s+/, '').replace(/\s+\=/, '').replace(/\s+/g, '').replace(/\n/g, '').replace(/,/g, '');

                if ( verbose ) {
                    console.log(cl.green('Registering exportable variable ') + cl.cyan.bold(vars));
                }

                try {
                    eval('exports["' + vars + '"] = ' + vars + ';');
                }
                catch ( err ) {}
            });

            return exports;
        }
    }

    return script;
};

/* Exporting As Module */
module.exports = Imports;

/* Trying to attach imports in global scope */
if ( 'undefined' !== typeof global ) {
    global.imports = Imports;
}


/* Script Importer */
var imports = function (source, options, verbose) {
    var cwd = new WorkingDirectory(), script;

    if ( 'string' === typeof source ) {
        /* Get start time */
        var pfstart = new Date().getTime();
        var stats, files;

        /* Try to get directory/file stats */
        try {
            stats = fs.statSync('./' + source);

            if ( stats.isDirectory() ) {
                /* Log in verbose */
                if ( verbose ) {
                    console.log(cl.blue.bold.italic('Sources is solved as directory.'));
                    console.log(cl.blue.bold.italic('Importing all files and folders inside ')
                    + cl.yellow.bold(source + '/'));
                }

                files = fs.readdirSync('./' + source);

                if ( files && files.length > 0 ) {
                    var scripts = '', result;

                    files.forEach(function (file, i) {
                        var scr = imports(source.replace(/\/$/, '') + '/' + file, options, verbose);

                        if ( scr ) {
                            scripts += scr.text;

                            if ( i == 0 ) {
                                result = scr;
                            }
                        }
                    });

                    if ( result ) {
                        result.text = scripts;

                        return result;
                    }
                }
            }
        }
        catch ( err ) {
            /* Try to search files if file/folder is not exist at all */
            /* Log in verbose */
            if ( verbose ) {
                console.log(cl.magenta.bold.italic('Can\'t resolve ')
                + cl.yellow.bold(source));

                console.log(cl.blue.bold.italic('Searching ')
                + cl.yellow.bold(source + '*'));
            }

            var find = gl.sync(source + '*');

            if ( find && find.length > 0 ) {
                var flist = '';

                find.forEach(function (file, i) {
                    flist += file + (i < flist.length ? ', ' : '');
                });

                if ( verbose ) {
                    console.log(cl.blue.bold.italic('Found ') + cl.yellow.bold(flist));
                }

                if ( find.length == 1 ) {
                    return imports(find[ 0 ], options, verbose);
                }

                else if ( find.length > 1 ) {
                    var scripts = '', result;

                    find.forEach(function (file, i) {
                        var scr = imports(file, options, verbose);

                        if ( scr ) {
                            scripts += scr.text;

                            if ( i == 0 ) {
                                result = scr;
                            }
                        }
                    });

                    if ( result ) {
                        result.text = scripts;

                        return result;
                    }
                }
            }
        }

        /* Ensure no error when options undefined */
        options = !options ? {} : options;

        /* Getting Options */
        var opt = {
            exec  : options.exec === undefined ? true : options.exec,
            async : options.async === undefined ? false : options.async,

            export        : options.export === undefined ? false : options.export,
            exportDir     : options.exportDir || pc.cwd() + '/' + pt.dirname(source) + '/export',
            exportMin     : options.exportMin === undefined ? true : options.exportMin,
            exportMap     : options.exportMap === undefined ? true : options.exportMap,
            exportOptions : options.exportOptions || undefined,
            beautify      : options.beautify === undefined ? true : options.beautify,
            formatter     : options.formatter === undefined ? null : options.formatter,
            noscript      : options.noscript === undefined ? false : options.noscript
        }

        /* If scripts should be executed */
        if ( opt.exec ) {
            /* If execute in async mode */
            if ( opt.async ) {
                script = new InlineScript(cwd, source, true, verbose);
            }

            /* If execute in sync */
            else {
                script = new InlineScript(cwd, source, false, verbose);
                script.run();
            }
        }

        /* If no execute */
        else {
            script = new InlineScript(cwd, source, false, verbose);
        }

        /* If export the imported scripts */
        if ( opt.export ) {
            var expfile = opt.exportDir.replace(/\/$/, '') + '/' + script.filename;

            if ( verbose ) {
                console.log(cl.blue('\nExporting to ') + cl.yellow.bold(expfile));
            }

            /* Touch Target File */
            fe.ensureFileSync(expfile);

            /* Create Formatter */
            var format;

            /* If formatter is defined and is function, use it. Else use javascript formatter */
            if ( opt.formatter && 'function' == typeof opt.formatter ) {
                format = opt.formatter;
            }
            else {
                format = bt;
            }

            /* Create script text */
            var scripttext = script.text;

            /* If should be beautified, beautify it. Else let it as is. */
            if ( opt.beautify ) {
                scripttext = format(script.text, {
                    indent_size               : 4,
                    space_after_anon_function : true,
                });

                /* Reduce too long line */
                scripttext = scripttext.replace(/[\n\r]{3}/g, '\r\n\r\n');
            }

            /* If this is javascript, append namespace worker since namespace only support for javascript */
            if ( !opt.noscript ) {
                scripttext = nspcons + scripttext;
            }

            /* Write script to target file */
            fs.writeFileSync(expfile, scripttext);

            /* If uglify */
            if ( opt.exportMin ) {
                var ugfile = opt.exportDir.replace(/\/$/, '') + '/' + pt.basename(script.file, '.js'), uglified;
                var ugfmap = ugfile + '.map';

                /* If export sourcemap file */
                if ( opt.exportMap ) {
                    /* If using custom options */
                    if ( opt.exportOptions ) {
                        uglified = ug.minify(expfile, opt.exportOptions);
                    }
                    /* If not using custom options */
                    else {
                        uglified = ug.minify(expfile, {
                            outSourceMap : pt.basename(script.file, '.js') + '.min.map'
                        });
                    }
                }

                /* If only uglify scripts */
                else {
                    if ( opt.exportOptions ) {
                        uglified = ug.minify(expfile, opt.exportOptions);
                    }
                    else {
                        uglified = ug.minify(expfile);
                    }
                }

                if ( verbose ) {
                    console.log(cl.blue('Exporting minified version to ') + cl.yellow.bold(ugfile + '.min.js'));
                }

                /* Write minified version to file. */
                fe.ensureFileSync(ugfile + '.min.js');
                fs.writeFileSync(ugfile + '.min.js', uglified.code);

                if ( opt.exportMap ) {
                    if ( verbose ) {
                        console.log(cl.blue('Exporting sourcemap to ') + cl.yellow.bold(ugfile + '.min.map'));
                    }

                    var txtMap = JSON.parse(uglified.map);
                    txtMap.sources[ 0 ] = script.filename;

                    /* Write sourcemap file */
                    fe.ensureFileSync(ugfile + '.min.map');
                    fs.writeFileSync(ugfile + '.min.map', JSON.stringify(txtMap));
                }
            }
        }

        var pfends = new Date().getTime();
        var pfcoun = (pfends - pfstart);
        pfcoun = pfcoun < 1000 ? pfcoun + 'ms' : (pfcoun / 1000) + 's';

        if ( verbose ) {
            console.log(cl.blue('\nImport finished in ') + cl.magenta.bold(pfcoun));
        }

        return script;
    }
}

/* Script Reader */
var InlineScript = function (cwd, file, sync, verbose) {
    if ( typeof file === 'string' ) {
        file = file.replace(/[\'\"\;]+/g, '');
    }

    this.cwds = cwd;
    this.file = file;
    this.text = '';

    this.async = sync === undefined ? true : sync;

    this.filename = pt.basename(file);
    this.dirname = pt.dirname(file);
    this.verbose = verbose;

    this.read();

    return this;
}

/* Script Reader Prototypes */
InlineScript.prototype = {
    read : function () {
        var scripttext;

        /* Changing CWD */
        this.cwds.push(this.dirname).apply();

        /* Log in verbose */
        if ( this.verbose ) {
            console.log(cl.cyan.bold.italic('@import') + ': ' + cl.yellow.bold(this.cwds.get().replace(this.cwds.cwds, '') + '/' + this.filename));
        }

        /* Reading Script File */
        try {
            scripttext = fs.readFileSync(this.filename, 'utf8');
        }
        catch ( err ) {
            throw err;
        }

        if ( scripttext ) {
            this.text = scripttext;
            this.fetch();
        }

        /* Restore CWD when finish */
        this.cwds.revert();

        return this;
    },

    fetch : function () {
        var $this = this, finalscripts = '';

        /* Collected Scripts */
        var scriptmaps = [];

        /* Getting Namespace */
        var namesp = this.text.match(nspRegEx);

        /* Creating Namespace content block and child holder */
        var nspblock, nspchilds = [];

        if ( namesp ) {
            namesp.forEach(function (namespace) {
                /* Getting Namespace name */
                var name = namespace.replace(/\@namespace\s+/, '').replace(/[\'\"\;]+/g, '');

                /* Namespace push start */
                nspblock = '\r\n\r\n// @write namespace %( ' + name + ' %) => \r\n' + name + '.push({ ';

                /* Registering name to itself */
                $this.namespace = name;

                /* Registering Namespace */
                if ( $this.verbose ) {
                    console.log(cl.green('Registering Namespace ') + cl.yellow.bold(name));
                }

                /* Appending Dashes */
                var nmsp = '';
                nmsp = '// ';
                for ( var i = 1; i < 100; ++i ) { nmsp += '-'; }
                nmsp += '\r\n';
                nmsp += '// @open namespace %( ' + name + ' )% => \n' + 'var ' + name + ' = new Namespace(\'' + name + '\');';

                /* Copying script text */
                var text = $this.text;

                /* Getting global variable lists */
                var txsplit = text.split(/[\r\n]+/), variables = [];

                txsplit.forEach(function (line) {
                    var hasvar = line.match(/^var\s+[a-zA-Z\d\_\$]+\s?\=/g);

                    if ( hasvar ) {
                        hasvar.forEach(function (vars) {
                            variables.push(vars);
                        });

                        var invar = line.match(/\,\s+[a-zA-Z\d\_\$]+\s?\=/g);

                        if ( invar ) {
                            invar.forEach(function (vars) {
                                variables.push(vars);
                            });
                        }
                    }

                    else {
                        hasvar = line.match(/^[a-zA-Z\d\_\$]+\s?\=/g);

                        if ( hasvar ) {
                            hasvar.forEach(function (vars) {
                                variables.push(vars);
                            });

                            var invar = line.match(/\,\s+[a-zA-Z\d\_\$]+\s?\=/g);

                            if ( invar ) {
                                invar.forEach(function (vars) {
                                    variables.push(vars);
                                });
                            }
                        }
                    }
                });

                if ( variables ) {
                    /* Registering global variables */
                    variables.forEach(function (vars) {
                        vars = vars.replace(/var?\s+/, '').replace(/\s+\=/, '').replace(/\s+/g, '').replace(/\n/g, '').replace(/,/g, '');

                        if ( $this.verbose ) {
                            console.log(cl.green('Registering ') + cl.cyan.bold(vars) + cl.green(' to ') + cl.yellow.bold(name));
                        }

                        nspblock += vars + ': ' + vars + ', '
                    });
                }

                /* Appending Namespace */
                $this.text = $this.text.replace(namespace, nmsp);
            });
        }

        /* Getting Dependencies pattern */
        var dep = this.text.match(impRegEx);

        /* If found, extract the dependencies */
        if ( dep ) {
            dep.forEach(function (file) {
                var multiple, multiscripts = '';

                /* Search comma separated file list and split it if found */
                if ( file.search(/\,/) > -1 ) {
                    multiple = file.replace(/\@import\s+/, '');
                    multiple = multiple.split(/\s?\,\s+/);
                }

                /* Search for directory file list */
                else if ( file.search(/\*/) > -1 ) {
                    dir = pt.dirname(file.replace(/\@import\s+/, '').replace(/\'/g, ''));

                    /* Reading directory */
                    files = fs.readdirSync(pc.cwd() + '/' + dir);

                    /* Creating filename array */
                    multiple = [];

                    /* Pushing files in dir to array */
                    files.forEach(function (file) {
                        multiple.push(dir + '/' + file);
                    });
                }

                /* Search patterned files */
                else {
                    var cfile = file.replace(/[\'\"\;]+/g, '').replace(/\@import\s+/, '').replace(/^\//, '');
                    var stats, files, cwdc = pc.cwd();

                    if ( cfile.match(/\$root/) ) {
                        cwdc = $this.cwds.cwds.replace(/\/$/, '');
                        cfile = cfile.replace(/\$root/, '').replace(/^\//, '');
                    }

                    /* Trying to find directory/file */
                    try {
                        /* Get file stats */
                        stats = fs.statSync(cwdc + '/' + cfile);

                        /* If stats is directory, then scan whole directory. */
                        if ( stats.isDirectory() === true ) {
                            files = fs.readdirSync(cwdc + '/' + cfile);

                            if ( files && files.length > 0 ) {
                                multiple = [];

                                files.forEach(function (name) {
                                    multiple.push(cfile + '/' + name);
                                });
                            }
                        }
                    }
                    catch ( err ) {
                        /* Search for files or folders if source is not exists at all */
                        if ( !fs.existsSync(cfile) ) {
                            var fnd = gl.sync(cfile + '*');

                            if ( fnd && fnd.length > 0 ) {
                                multiple = fnd;
                            }
                            else {
                                console.log(cl.red.bold('ERROR! Can not resolve sources, or sources is not string or directory.'));
                                throw err;
                            }
                        }
                    }
                }

                /* Proceed multiple imports */
                if ( multiple ) {
                    multiple.forEach(function (file) {
                        var ilScript = new InlineScript($this.cwds, file, $this.async, $this.verbose);

                        if ( ilScript ) {
                            multiscripts += ilScript.text + '\n';

                            if ( namesp && ilScript.namespace ) {
                                nspchilds.push(ilScript.namespace);
                            }
                        }
                    });

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if ( multiscripts ) {
                        scriptmaps.push({ name : file, scripts : multiscripts });
                    }
                }

                /* Proceed single import */
                else {
                    /* Creating new Inline Script */
                    var ilScript = new InlineScript($this.cwds, file.replace(/\@import\s+/, ''), $this.async, $this.verbose);

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if ( ilScript ) {
                        scriptmaps.push({ name : file, scripts : ilScript.text });

                        if ( namesp && ilScript.namespace ) {
                            nspchilds.push(ilScript.namespace);
                        }
                    }
                }
            });
        }

        /* If script should be executed in async mode */
        if ( $this.async ) {
            $this.run();
        }

        /* Close namespace after iterating namespace */
        if ( namesp ) {
            /* Iterating child namespace */
            nspchilds.forEach(function (name) {
                nspblock += name + ': ' + name + ', '
            });

            nspblock = nspblock.replace(/[\,\s]+$/, '');

            /* Closing Namespace content block */
            nspblock += '});\r\n// @close namespace %( ' + this.namespace + ' )% <= \r\n';

            /* Appending Dashes */
            nspblock += '// ';
            for ( var i = 1; i < 100; ++i ) { nspblock += '-'; }
            nspblock += '\r\n';

            /* Append to current scripts */
            $this.text += nspblock;
        }

        /* Replacing Dependencies pattern with scripts */
        scriptmaps.forEach(function (item) {
            $this.text = $this.text.replace(item.name, item.scripts);
        });

        return this;
    },

    get : function () {
        return this.text;
    },

    run : function () {
        if ( this.verbose ) {
            console.log(cl.blue.bold('\nEvaluating imported scripts...'));
        }

        /* Try to evaluate scripts on global context */
        try {
            (1, eval)(this.text);
        }
        catch ( err ) {
            throw err;
        }

        return this;
    }
}

/* RegEx to get import patterns */
var impRegEx = /[\'\"]\@import\s+[a-zA-Z\d\.\_\-\/\.\,\$\@\#\!\~\s\&\*\+\\]+[\'\"\;]+/g;
var nspRegEx = /[\'\"]\@namespace\s+[a-zA-Z\d_\$]+[\'\"\;]+/g;
var fnbRegEx = /(function\s?)([^\.])([\w|,|\s|-|_|\$]*)(.+?\{)([^\.][\s|\S]*(?=\}))/g;

/* Current Working Directory Lists */
var WorkingDirectory = function () {
    this.cwds = pc.cwd() + '/';

    this.length = 0;

    return this;
}

/* CWD Methods */
WorkingDirectory.prototype = {
    push : function (dirname) {
        if ( typeof dirname == 'string' ) {
            dirname = dirname.replace(/[\'\"\;]+/g, '');

            if ( dirname.match(/^\$root/) ) {
                dirname = dirname.replace(/^\$root/, '');
            }
            else {
                dirname = (this[ this.length - 1 ] || '') + (dirname == '.' ? '' : '/' + dirname);
            }

            this[ this.length ] = dirname;
            this.length++;
        }

        return this;
    },

    apply : function () {
        var nextdir = this[ this.length - 1 ] || '';

        nextdir = nextdir.replace(/^\//, '');
        nextdir = this.cwds.replace(/\/$/, '') + '/' + nextdir;

        try {
            pc.chdir(nextdir);
        }
        catch ( err ) {
            throw cl.red('Unable to solve directory: ') + cl.yellow(nextdir) + '\n' + err;
        }

        return this;
    },

    revert : function () {
        delete this[ this.length - 1 ];
        this.length--;

        this.apply();

        return this;
    },

    get : function () {
        return pc.cwd();
    }
}

/* Namespace Constructor */
$.Namespace = function (name) {
    if ( typeof name === 'string' ) {
        this.constructor.name = name;
    }

    return this;
}

$.Namespace.prototype = {
    push : function (name, obj) {
        var $namespace = this;

        if ( 'string' === typeof name && 'undefined' !== typeof obj ) {
            this[ name ] = obj;
        }

        else if ( 'object' === typeof name && !name.length ) {
            for ( var key in name ) {
                if ( name.hasOwnProperty(key) ) {
                    $namespace[ key ] = name[ key ];
                }
            }
        }

        return this;
    },

    json : function () {
        return JSON.stringify(this);
    }
}

/* Namespace Constructor */
var nspcons = "var _GLB = 'undefined' != typeof global ? global : window; if (!_GLB.Namespace) {_GLB.Namespace = function(name) {if (typeof name === 'string') {this.constructor.name = name;}return this;};_GLB.Namespace.prototype = {push: function(obj) {var $namespace = this;if (typeof obj === 'object' && !obj.length) {for (var key in obj) {if (obj.hasOwnProperty(key)) { $namespace[key] = obj[key]; }}}return this;},}}\n\n";


/* Simple Include */
var IncConfig = {
    defpath : './',
    verbose : false
};

/* Resolver */
var resolve = function (path) {
    if ( IncConfig.verbose ) { console.log(cl.cyan.bold('Searching ') + cl.yellow.bold(path)); }

    var regsearch = gl.sync(path);

    if ( regsearch && regsearch.length > 0 ) {
        if ( IncConfig.verbose ) { console.log(cl.cyan.bold('Including ') + cl.yellow.bold(regsearch[ 0 ])); }

        return regsearch[ 0 ];
    }

    else {
        if ( IncConfig.verbose ) { console.log(cl.red.bold('Not Found ') + cl.yellow.bold(path)); }

        return false;
    }
}

/* Forwarder */
var Include = function (file) {
    var path = IncConfig.defpath + '/' + file, result;

    if ( IncConfig.verbose ) { console.log(cl.cyan.bold('Including ') + cl.yellow.bold(path)); }

    try {
        return require(IncConfig.defpath + '/' + file);
    }
    catch ( err ) {
        if ( IncConfig.verbose ) { console.log(cl.red.bold('Not Found ') + cl.yellow.bold(path)); }

        path = IncConfig.defpath + '/' + file.replace(/\/$/, '') + '/' + 'index.js';

        var exist = resolve(path);

        if ( exist ) {
            return require(exist);
        }
        else {
            path = IncConfig.defpath + '/**/' + file.replace(/\/$/, '') + '/' + file + '.js';

            exist = resolve(path);

            if ( exist ) {
                return require(exist);
            }
            else {
                path = IncConfig.defpath + '/**/' + file + '*.js';

                exist = resolve(path);

                if ( exist ) {
                    return require(exist);
                }
                else {
                    path = IncConfig.defpath + '/**/' + file;

                    exist = resolve(path);

                    if ( exist ) {
                        return require(exist);
                    }
                    else {
                        var error = cl.red.bold('Unable to find module ') + cl.yellow.bold(file);

                        throw error;
                    }
                }
            }
        }
    }
}

/* Setting Include Location */
Include.location = function (url) {
    if ( fs.existsSync(url) ) {
        IncConfig.defpath = url.replace(/\/$/, '');
    }

    return Include;
}

/* Setting Verbose Include */
Include.verbose = function (bool) {
    IncConfig.verbose = bool;

    return Include;
}

/* Export to global object */
if ( 'undefined' != typeof global ) {
    global.include = Include;
}