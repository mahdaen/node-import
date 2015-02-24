'@import data/home.js';
'@import data/about.js';

/* Test Global Var */
console.log(title);

/* Test private var */
console.log(home.title, home.$name);
console.log(about.title);

/* Test Namespace Object */
console.log(home);
console.log(about);