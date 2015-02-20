var imports = require('../index.js');

var result = imports('test/src/a.js', {
    exec: true,
    export: true,
    exportDir: 'test/out',
    exportMin: true,
    exportMap: true
}, true);
