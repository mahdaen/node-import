/* Imported from b.js */
'@import b.js, sub/c.js';
'@import sub/c.js, sub/d.js';
'@import sub/*.js';

/* This line is contents of a.js */
var scriptA = 'Script contains A';

var a = 200;

/* Should get the "a" from namespace "foo" */
console.log('The content of "foo.a" is: ' + foo.a);

/* Should get "a" from itself */
console.log('The content of "a" is: ' + a);

/* Displaying contents of foo */
console.log(foo);

/* Imported from sub/c.js */
'@import sub/c.js';

console.log('This line should be executed at the end of import.');
