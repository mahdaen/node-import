var _GLB = 'undefined' != typeof global ? global : window;
if (!_GLB.Namespace) {
    _GLB.Namespace = function (name) {
        if (typeof name === 'string') {
            this.constructor.name = name;
        }
        return this;
    };
    _GLB.Namespace.prototype = {
        push: function (obj) {
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
}

var cl = require('colors/safe');

/* Importing Teams */
// ---------------------------------------------------------------------------------------------------
// @open namespace %( michael )% => 
var michael = new Namespace('michael');

var age = 17;

var profile = function () {
    var person = '';
    console.log('Name: Michael John', 'Age: ' + age);

    var cint = '',
        tas = '';

    var yop = function () {
        var og = function () {

        }
    }
}

var tuti = 1,
    santi = 0;
var tuta = 2;

var xx = function () {
    function simple() {

    }
}

var bar = 'Bar from Michael';

// @write namespace %( michael %) => 
michael.push({
    age: age,
    profile: profile,
    tuti: tuti,
    santi: santi,
    tuta: tuta,
    xx: xx,
    bar: bar
});
// @close namespace %( michael )% <= 
// ---------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------
// @open namespace %( smith )% => 
var smith = new Namespace('smith');

var age = 19;

var profile = function () {
    console.log('Name: Smith Andreas', 'Age: ' + age);
}

var foo = 'Foo from Smith';

// @write namespace %( smith %) => 
smith.push({
    age: age,
    profile: profile,
    foo: foo
});
// @close namespace %( smith )% <= 
// ---------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------
// @open namespace %( william )% => 
var william = new Namespace('william');

var age = 15;

var profile = function () {
    console.log('Name: William Alexander', 'Age: ' + age);
}

var foobar = 'Foobar from William';

// @write namespace %( william %) => 
william.push({
    age: age,
    profile: profile,
    foobar: foobar
});
// @close namespace %( william )% <= 
// ---------------------------------------------------------------------------------------------------


/* Showing Michael */
console.log(cl.green('\nIt should be display profile of Michael with age overriden by William'));
michael.profile();

/* Showing Smith */
console.log(cl.green('\nIt should be display profile of Smith with age overriden by William'));
smith.profile();

/* Showing William */
console.log(cl.green('\nIt should be display profile of William'));
william.profile();

/* Getting Variables from namespaces */
console.log(cl.green('\nIt should be display ages of Michael'));
console.log(michael.age);

console.log(cl.green('\nIt should be display ages of Smith'));
console.log(smith.age);

console.log(cl.green('\nIt should be display ages of William'));
console.log(william.age);

/* Getting Globa Variables */
console.log(cl.green('\nIt should be display "foo" from Michael'));
console.log(foo);

console.log(cl.green('\nIt should be display "bar" from Smith'));
console.log(bar);

console.log(cl.green('\nIt should be display "foobar" from William'));
console.log(foobar);