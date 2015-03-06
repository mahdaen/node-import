var imports = require('../index.js');

module.exports = function() {
    var result = imports.module('test/people', {}, true);

    console.dir(result);
}