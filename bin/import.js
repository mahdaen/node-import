#!/usr/bin/env node

var colors = require('colors/safe');
var optimis = require('optimist');
var imports = require('../index.js');
var package = require('../package.json');

/* Boolean Getter */
var tobool = function(obj) {
    if ('string' === typeof obj) {
        if (obj === 'true') {
            return true;
        }
        else if (obj === 'false') {
            return false;
        }
    }

    else if ('boolean' === typeof obj) {
        if (obj === true) {
            return true;
        }
        else if (obj === false) {
            return false;
        }
    }

    return undefined;
}

/* Usage Help */
var usage =
    colors.cyan('NodeJS Scripts Export (' + package.name + ')\n') +
    colors.green('Version: ') + package.version + '\n' +
    colors.green('Description: ') + package.description + '\n' +
    colors.green('Usage: ') + colors.yellow('import') + ' ' + colors.cyan('[options] [files ...]');

/* Executor */
var exec = function (argv) {
    var run = tobool(argv.r);
    var asy = tobool(argv.a);
    var exp = tobool(argv.e);
    var min = tobool(argv.u);
    var map = tobool(argv.s);
    var dir = 'string' == typeof argv.o ? argv.o : null;

    var opt = {
        exec: run,
        sync: !asy,
        export: exp,
        exportDir: dir,
        exportMin: min,
        exportMap: map,
    }

    return imports(argv._, opt, argv.v);
}

/* Registering Options */
optimis
    .usage(usage)
    .options('r', {
        describe: 'Run imported scripts.',
        type: 'boolean',
        default: true
    })
    .options('a', {
        describe: 'Run in async mode.',
        type: 'boolean',
        default: false
    })
    .options('e', {
        describe: 'Export imported scripts.',
        type: 'boolean',
        default: false
    })
    .options('u', {
        describe: 'Uglify exported scripts.',
        type: 'boolean',
        default: true
    })
    .options('s', {
        describe: 'Include sourcemap of exported scripts.',
        type: 'boolean',
        default: true
    })
    .options('o', {
        describe: 'Output directory for exported scripts.',
        type: 'string',
        default: null
    })
    .options('v', {
        describe: 'Logs all processes.',
        type: 'boolean',
        default: false
    })
    .options('h', {
        describe: 'Show helps.'
    })
    .check(function (argv) {
        if (argv.h) {
            return optimis.showHelp();
        } else {
            if (!argv._.length) {
                throw new Error("input required");
            } else {
                exec(argv);
            }
        }
    })
    .argv;
