var cl = require('colors/safe');

/* Importing Teams */
// ---------------------------------------------------------------------------------------------------
// @open namespace %( michael )% =>
var age = 17;

var profile = function () {
    console.log('Name: Michael John', 'Age: ' + age);
}

var bar = 'Bar from Michael';

// @write namespace %( michael %) => 
var michael = {
    age: age,
    profile: profile,
    bar: bar
};
// @close namespace %( michael )% <= 
// ---------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------
// @open namespace %( smith )% =>
var age = 19;

var profile = function () {
    console.log('Name: Smith Andreas', 'Age: ' + age);
}

var foo = 'Foo from Smith';

// @write namespace %( smith %) => 
var smith = {
    age: age,
    profile: profile,
    foo: foo
};
// @close namespace %( smith )% <= 
// ---------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------
// @open namespace %( william )% =>
var age = 15;

var profile = function () {
    console.log('Name: William Alexander', 'Age: ' + age);
}

var foobar = 'Foobar from William';

// @write namespace %( william %) => 
var william = {
    age: age,
    profile: profile,
    foobar: foobar
};
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