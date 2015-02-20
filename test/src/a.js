/* Imported from b.js */
'@import b.js, sub/c.js';
'@import sub/c.js, sub/d.js';
'@import sub/*.js';

/* This line is contents of a.js */
var scriptA = 'Script contains A';

/* Imported from sub/c.js */
'@import sub/c.js';

console.log('This line should be executed at the end of import.');
