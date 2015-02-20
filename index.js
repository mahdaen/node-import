/* Required Modules */
var pc = process;
var fs = require('fs');
var fe = require('fs-extra');
var pt = require('path');
var ug = require('uglify-js');
var cl = require('colors/safe');

/* Exporting Modules */
module.exports = function(source, options, verbose) {
    /* Single file import */
    if ('string' == typeof source) {
        return imports(source, options, verbose);
    }

    /* Multiple files import */
    else if ('object' == typeof source) {
        /* Creating scripts holder */
        var scripts = '';

        /* Files in array */
        if (Array.isArray(source)) {
            source.forEach(function(file) {
                scripts += imports(file, options, verbose);
            });
        }

        /* Files in object */
        else {
            source.forEach(function(file, options) {
                scripts += imports(file, options, verbose);
            });
        }
    }
}

/* Script Importer */
var imports = function(source, options, verbose) {
    var cwd = new WorkingDirectory(), script;

    if ('string' === typeof source) {
        /* Get start time */
        var pfstart = new Date().getTime();

        /* Ensure no error when options undefined */
        options = !options ? {} : options;

        /* Getting Options */
        var opt = {
            exec: options.exec === undefined ? true : options.exec,
            sync: options.sync === undefined ? true : options.sync,

            export: options.export === undefined ? false : options.export,
            exportDir: options.exportDir || pc.cwd() + '/' + pt.dirname(source) + '/export',
            exportMin: options.exportMin || true,
            exportMap: options.exportMap || false,
            exportOptions: options.exportOptions || undefined
        }

        /* If scripts should be executed */
        if (opt.exec) {
            /* If execute in sync mode */
            if (opt.sync) {
                script = new InlineScript(cwd, source, true, verbose);
                script.run();
            }

            /* If execute in async */
            else {
                script = new InlineScript(cwd, source, false, verbose);
            }
        }

        /* If no execute */
        else {
            script = new InlineScript(cwd, source, true, verbose);
        }

        /* If export the imported scripts */
        if (opt.export) {
            var expfile = opt.exportDir.replace(/\/$/, '') + '/' + script.filename;

            if (verbose) {
                console.log(cl.blue('\nExporting to ') + cl.yellow.bold(expfile));
            }

            /* Touch Target File */
            fe.ensureFileSync(expfile);

            /* Write script to target file */
            fs.writeFileSync(expfile, script.text);

            /* If uglify */
            if (opt.exportMin) {
                var ugfile = opt.exportDir.replace(/\/$/, '') + '/' + pt.basename(script.file, '.js'), uglified;
                var ugfmap = ugfile + '.map';

                /* If export sourcemap file */
                if (opt.exportMap) {
                    /* If using custom options */
                    if (opt.exportOptions) {
                        uglified = ug.minify(expfile, opt.exportOptions);
                    }
                    /* If not using custom options */
                    else {
                        uglified = ug.minify(expfile, {
                            outSourceMap: ugfile + '.map'
                        });
                    }
                }

                /* If only uglify scripts */
                else {
                    if (opt.exportOptions) {
                        uglified = ug.minify(expfile, opt.exportOptions);
                    }
                    else {
                        uglified = ug.minify(expfile);
                    }
                }

                if (verbose) {
                    console.log(cl.blue('Exporting minified version to ') + cl.yellow.bold(ugfile + '.min.js'));
                }

                fe.ensureFileSync(ugfile + '.min.js');
                fs.writeFileSync(ugfile + '.min.js', uglified.code);

                if (opt.exportMap) {
                    if (verbose) {
                        console.log(cl.blue('Exporting sourcemap to ') + cl.yellow.bold(ugfile + '.min.map'));
                    }

                    fe.ensureFileSync(ugfile + '.min.map');
                    fs.writeFileSync(ugfile + '.min.map', uglified.map);
                }
            }
        }

        var pfends = new Date().getTime();
        var pfcoun = (pfends - pfstart);
        pfcoun = pfcoun < 1000 ? pfcoun + 'ms' : (pfcoun / 1000) + 's';

        if (verbose) {
            console.log(cl.blue('\nImport finished in ') + cl.magenta.bold(pfcoun));
        }

        return script.get();
    }
}

/* Script Reader */
var InlineScript = function(cwd, file, sync, verbose) {
    this.cwds = cwd;
    this.file = file;
    this.text = '';

    this.sync = sync === undefined ? true : sync;

    this.filename = pt.basename(file);
    this.dirname = pt.dirname(file);
    this.verbose = verbose;

    this.read();

    return this;
}

/* Script Reader Prototypes */
InlineScript.prototype = {
    read: function() {
        var scripttext;

        /* Changing CWD */
        this.cwds.push(this.dirname).apply();

        /* Log in verbose */
        if (this.verbose) {
            console.log(cl.cyan.bold.italic('@import') + ': ' + cl.yellow(this.cwds.get().replace(this.cwds.cwds, '') + '/' + this.filename));
        }

        /* Reading Script File */
        try {
            scripttext = fs.readFileSync(this.filename, 'utf8');
        } catch (err) {
            throw err;
        }

        if (scripttext) {
            this.text = scripttext;
            this.fetch();
        }

        /* Restore CWD when finish */
        this.cwds.revert();

        return this;
    },

    fetch: function() {
        var $this = this;

        /* Getting Namespace */
        var nsp = this.text.match(nspRegEx);

        if (nsp) {
            nsp.forEach(function(namespace) {
                /* Getting Namespace name */
                var name = namespace.replace(/\@namespace\s+/, '');

                /* Registering Namespace */
                if ($this.verbose) {
                    console.log(cl.green('Registering Namespace ') + cl.yellow.bold(name));
                }
                var nmsp = 'var ' + name + ' = new Namespace(\'' + name + '\');';

                /* Copying script text */
                var text = $this.text;

                /* Getting Function blocks to escape local variables */
                var fnblock = text.match(fnbRegEx);

                if (fnblock) {
                    /* Removing function blocks in temporary script to prevent capturing local variables */
                    fnblock.forEach(function(fnstring) {
                        text = text.replace(fnstring, '');
                    });
                }

                /* Getting global variable lists */
                var vrtb = text.match(/var\s+[a-zA-Z\d\_]+\s+\=/g);

                /* Creating Namespace content block */
                var nspblock = '\n\n/* $NAMESPACES$ */\n' + name + '.push({ ';

                /* Registering global variables */
                vrtb.forEach(function (vars) {
                    vars = vars.replace(/var\s+/, '').replace(/\s+\=/, '');

                    if ($this.verbose) {
                        console.log(cl.green('Registering ') + cl.cyan.bold(vars) + cl.green(' to ') + cl.yellow.bold(name));
                    }

                    nspblock += vars + ': ' + vars + ', '
                });

                /* Closing Namespace content block */
                nspblock += '});\n';

                /* Appending Namespace */
                $this.text = $this.text.replace('"' + namespace + '";', nmsp);
                $this.text = $this.text.replace("'" + namespace + "';", nmsp);

                $this.text = $this.text.replace('"' + namespace + '"', nmsp);
                $this.text = $this.text.replace("'" + namespace + "'", nmsp);

                /* Append to current scripts */
                $this.text += nspblock;
            });
        }

        /* Getting Dependencies pattern */
        var dep = this.text.match(impRegEx);

        /* If found, extract the dependencies */
        if (dep) {
            dep.forEach(function(file) {
                var nfile, multiscripts = '';

                if (file.search(/\,/) > -1) {
                    nfile = file.replace(/\@import\s+/, '');
                    nfile = nfile.split(/\s?\,\s+/);
                }

                else if (file.search(/\*/) > -1) {
                    dir = pt.dirname(file.replace(/\@import\s+/, ''));

                    files = fs.readdirSync(pc.cwd() + '/' + dir);

                    nfile = [];

                    files.forEach(function(file) {
                        nfile.push(dir + '/' + file);
                    });
                }

                if (nfile) {
                    nfile.forEach(function(file) {
                        var ils = new InlineScript($this.cwds, file, $this.sync, $this.verbose);
                        multiscripts += ils.text + '\n';
                    });

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if ($this.sync) {
                        $this.text = $this.text.replace("'" + file + "'" + ';', multiscripts);
                        $this.text = $this.text.replace('"' + file + '"' + ';', multiscripts);

                        $this.text = $this.text.replace("'" + file + "'", multiscripts);
                        $this.text = $this.text.replace('"' + file + '"', multiscripts);
                    }
                }

                else {
                    /* Creating new Inline Script */
                    var ils = new InlineScript($this.cwds, file.replace(/\@import\s+/, ''), $this.sync, $this.verbose);

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if (ils && $this.sync) {
                        $this.text = $this.text.replace("'" + file + "'" + ';', ils.text);
                        $this.text = $this.text.replace('"' + file + '"' + ';', ils.text);

                        $this.text = $this.text.replace("'" + file + "'", ils.text);
                        $this.text = $this.text.replace('"' + file + '"', ils.text);
                    }
                }
            });
        }

        /* If script should be executed in async mode */
        if ($this.sync === false) {
            $this.run();
        }

        return this;
    },

    get: function() {
        return this.text;
    },

    run: function() {
        if (this.verbose) {
            console.log(cl.blue.bold('\nEvaluating imported scripts...'));
        }

        try {
            eval(this.text);
        } catch (err) {
            throw err;
        }

        return this;
    }
}

/* RegEx to get import patterns */
var impRegEx = /\@import\s+[a-zA-Z\d\.\_\-\/\.\,\$\@\#\!\~\s\&\*\(\)\+\\]+/g;
var nspRegEx = /\@namespace\s+[a-zA-Z\d_\$]+/g;
var fnbRegEx = /(function\s?)([^\.])([\w|,|\s|-|_|\$]*)(.+?\{)([^\.][\s|\S]*(?=\}))/g;

/* Current Working Directory Lists */
var WorkingDirectory = function() {
    this.cwds = pc.cwd() + '/';

    this.length = 0;

    return this;
}

/* CWD Methods */
WorkingDirectory.prototype = {
    push: function(dirname) {
        if (typeof dirname == 'string') {
            dirname = (this[this.length - 1] || '') + (dirname == '.' ? '' : '/' + dirname);

            this[this.length] = dirname;
            this.length++;
        }

        return this;
    },

    apply: function() {
        var nextdir = this[this.length - 1] || '';

        try {
            pc.chdir(this.cwds + nextdir);
        } catch (err) {
            throw cl.red('Unable to solve directory: ') + cl.yellow(this.cwds + nextdir) + '\n' + err;
        }

        return this;
    },

    revert: function() {
        delete this[this.length - 1];
        this.length--;

        this.apply();

        return this;
    },

    get: function() {
        return pc.cwd();
    }
}

/* Namespace Constructor */
var Namespace = function(name) {
    if (typeof name === 'string') {
        this.constructor.name = name;
    }

    return this;
}

Namespace.prototype = {
    push: function(obj) {
        var $namespace = this;

        if (typeof obj === 'object' && !obj.length) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    $namespace[key] = obj[key];
                }
            }
        }

        return this;
    }
}
