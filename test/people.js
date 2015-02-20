var cl = require('colors/safe');

/* Importing Teams */
'@import team/michael.ns.js';
'@import team/smith.ns.js';
'@import team/william.ns.js';

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


