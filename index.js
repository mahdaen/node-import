/* Global Wrapper */
var $ = global;

/* Required Modules */
var pc = process;
var fs = require('fs');
var fe = require('fs-extra');
var pt = require('path');
var ug = require('uglify-js');
var cl = require('colors/safe');
var bt = require('js-beautify').js_beautify;

var $r = process.cwd();

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
            async: options.async === undefined ? false : options.async,

            export: options.export === undefined ? false : options.export,
            exportDir: options.exportDir || pc.cwd() + '/' + pt.dirname(source) + '/export',
            exportMin: options.exportMin === undefined ? true : options.exportMin,
            exportMap: options.exportMap === undefined ? false : options.exportMap,
            exportOptions: options.exportOptions || undefined
        }

        /* If scripts should be executed */
        if (opt.exec) {
            /* If execute in async mode */
            if (opt.async) {
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
        if (opt.export) {
            var expfile = opt.exportDir.replace(/\/$/, '') + '/' + script.filename;

            if (verbose) {
                console.log(cl.blue('\nExporting to ') + cl.yellow.bold(expfile));
            }

            /* Touch Target File */
            fe.ensureFileSync(expfile);

            /* Write script to target file */
            fs.writeFileSync(expfile, nspcons + bt(script.text, {
                indent_size: 4,
                space_after_anon_function: true,
            }).replace(/[\n\r]{3}/g, '\r\n\r\n'));

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
    if (typeof file === 'string') {
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
        var $this = this, finalscripts = '';

        /* Collected Scripts */
        var scriptmaps = [];

        /* Getting Namespace */
        var namesp = this.text.match(nspRegEx);

        /* Creating Namespace content block and child holder */
        var nspblock, nspchilds = [];

        if (namesp) {
            namesp.forEach(function(namespace) {
                /* Getting Namespace name */
                var name = namespace.replace(/\@namespace\s+/, '').replace(/[\'\"\;]+/g, '');

                /* Namespace push start */
                nspblock = '\n\n' + name + '.push({ ';

                /* Registering name to itself */
                $this.namespace = name;

                /* Registering Namespace */
                if ($this.verbose) {
                    console.log(cl.green('Registering Namespace ') + cl.yellow.bold(name));
                }
                var nmsp = '// @open namespace => \n' + 'var ' + name + ' = new Namespace(\'' + name + '\');';

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
                var vrtb = text.match(/[\n\,\s]+[a-zA-Z\d\_\$]+\s?\=/g);

                if (vrtb) {
                    var vrta = text.match(/var\s+[a-zA-Z\d\_\$]+\s?\=/g);

                    if (vrta) {
                        vrtb.concat(vrta);
                    }
                }

                if (vrtb) {
                    /* Registering global variables */
                    vrtb.forEach(function (vars) {
                        vars = vars.replace(/var?\s+/, '').replace(/\s+\=/, '').replace(/\s+/g, '').replace(/\n/g, '').replace(/,/g, '');

                        if ($this.verbose) {
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
        if (dep) {
            dep.forEach(function(file) {
                var multiple, multiscripts = '';

                /* Search comma separated file list and split it if found */
                if (file.search(/\,/) > -1) {
                    multiple = file.replace(/\@import\s+/, '');
                    multiple = multiple.split(/\s?\,\s+/);
                }

                /* Search for directory file list */
                else if (file.search(/\*/) > -1) {
                    dir = pt.dirname(file.replace(/\@import\s+/, ''));

                    /* Reading directory */
                    files = fs.readdirSync(pc.cwd() + '/' + dir);

                    /* Creating filename array */
                    multiple = [];

                    /* Pushing files in dir to array */
                    files.forEach(function(file) {
                        multiple.push(dir + '/' + file);
                    });
                }

                /* Proceed multiple imports */
                if (multiple) {
                    multiple.forEach(function(file) {
                        var ilScript = new InlineScript($this.cwds, file, $this.async, $this.verbose);

                        if (ilScript) {
                            multiscripts += ilScript.text + '\n';

                            if (namesp && ilScript.namespace) {
                                nspchilds.push(ilScript.namespace);
                            }
                        }
                    });

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if (multiscripts) {
                        scriptmaps.push({ name: file, scripts: multiscripts });
                    }
                }

                /* Proceed single import */
                else {
                    /* Creating new Inline Script */
                    var ilScript = new InlineScript($this.cwds, file.replace(/\@import\s+/, ''), $this.async, $this.verbose);

                    /* If inline scripts created and execute in synchronus mode, replace pattern with script text */
                    if (ilScript) {
                        scriptmaps.push({ name: file, scripts: ilScript.text });

                        if (namesp && ilScript.namespace) {
                            nspchilds.push(ilScript.namespace);
                        }
                    }
                }
            });
        }

        /* If script should be executed in async mode */
        if ($this.async) {
            $this.run();
        }

        /* Close namespace after iterating namespace */
        if (namesp) {
            /* Iterating child namespace */
            nspchilds.forEach(function(name) {
                nspblock += name + ': ' + name + ', '
            });

            /* Closing Namespace content block */
            nspblock += '});\r\n// @close namespace <= \r\n';

            /* Append to current scripts */
            $this.text += nspblock;
        }

        /* Replacing Dependencies pattern with scripts */
        scriptmaps.forEach(function(item) {
            $this.text = $this.text.replace(item.name, item.scripts);
        });

        return this;
    },

    get: function() {
        return this.text;
    },

    run: function() {
        if (this.verbose) {
            console.log(cl.blue.bold('\nEvaluating imported scripts...'));
        }

        /* Try to evaluate scripts on global context */
        try {
            (1, eval)(this.text);
        } catch (err) {
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
var WorkingDirectory = function() {
    this.cwds = pc.cwd() + '/';

    this.length = 0;

    return this;
}

/* CWD Methods */
WorkingDirectory.prototype = {
    push: function(dirname) {
        if (typeof dirname == 'string') {
            dirname = dirname.replace(/[\'\"\;]+/g, '');

            if (dirname.match(/^\$root/)) {
                dirname = dirname.replace(/^\$root/, '');
            } else {
                dirname = (this[this.length - 1] || '') + (dirname == '.' ? '' : '/' + dirname);
            }

            this[this.length] = dirname;
            this.length++;
        }

        return this;
    },

    apply: function() {
        var nextdir = this[this.length - 1] || '';

        nextdir = nextdir.replace(/^\//, '');
        nextdir = this.cwds.replace(/\/$/, '') + '/' + nextdir;

        try {
            pc.chdir(nextdir);
        } catch (err) {
            throw cl.red('Unable to solve directory: ') + cl.yellow(nextdir) + '\n' + err;
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
$.Namespace = function(name) {
    if (typeof name === 'string') {
        this.constructor.name = name;
    }

    return this;
}

$.Namespace.prototype = {
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
    },
}

/* Namespace Constructor */
var nspcons = "var _GLB = global || window; if (!_GLB.Namespace) {_GLB.Namespace = function(name) {if (typeof name === 'string') {this.constructor.name = name;}return this;};_GLB.Namespace.prototype = {push: function(obj) {var $namespace = this;if (typeof obj === 'object' && !obj.length) {for (var key in obj) {if (obj.hasOwnProperty(key)) {$namespace[key] = obj[key];}}}return this;},}}\n\n";
