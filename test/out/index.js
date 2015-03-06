var _GLB = 'undefined' != typeof global ? global : window; if (!_GLB.Namespace) {_GLB.Namespace = function(name) {if (typeof name === 'string') {this.constructor.name = name;}return this;};_GLB.Namespace.prototype = {push: function(obj) {var $namespace = this;if (typeof obj === 'object' && !obj.length) {for (var key in obj) {if (obj.hasOwnProperty(key)) {$namespace[key] = obj[key];}}}return this;},}}

var imports = require('node-import');

module.exports = function () {
    imports.module('people');
}