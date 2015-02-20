/* Imported from b.js */
/* Creating Namespace */
var foo = new Namespace('foo');

/* Imported from sub/c.js */
/* Creating Namespace */
var bar = new Namespace('bar');

/* Imported from d.js */
var scriptD = 'Scripts contains D';

/* This is contents of c.js */
var scriptC = 'Scripts contains C';

var foobar = 'This is a foobar of namespace "bar"';


/* $NAMESPACES$ */
bar.push({ scriptC: scriptC, foobar: foobar, });


/* This line is contents of b.js */
var scriptB = 'Script contains B';

var bar = function () {
    var a = 1;
    var b = 2;
}

var a = 3;
var b = 4;

/* $NAMESPACES$ */
foo.push({ scriptB: scriptB, bar: bar, a: a, b: b, });

/* Creating Namespace */
var bar = new Namespace('bar');

/* Imported from d.js */
var scriptD = 'Scripts contains D';

/* This is contents of c.js */
var scriptC = 'Scripts contains C';

var foobar = 'This is a foobar of namespace "bar"';


/* $NAMESPACES$ */
bar.push({ scriptC: scriptC, foobar: foobar, });


/* Creating Namespace */
var bar = new Namespace('bar');

/* Imported from d.js */
var scriptD = 'Scripts contains D';

/* This is contents of c.js */
var scriptC = 'Scripts contains C';

var foobar = 'This is a foobar of namespace "bar"';


/* $NAMESPACES$ */
bar.push({ scriptC: scriptC, foobar: foobar, });

var scriptD = 'Scripts contains D';

/* Creating Namespace */
var bar = new Namespace('bar');

/* Imported from d.js */
var scriptD = 'Scripts contains D';

/* This is contents of c.js */
var scriptC = 'Scripts contains C';

var foobar = 'This is a foobar of namespace "bar"';


/* $NAMESPACES$ */
bar.push({ scriptC: scriptC, foobar: foobar, });

var scriptD = 'Scripts contains D';


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
/* Creating Namespace */
var bar = new Namespace('bar');

/* Imported from d.js */
var scriptD = 'Scripts contains D';

/* This is contents of c.js */
var scriptC = 'Scripts contains C';

var foobar = 'This is a foobar of namespace "bar"';


/* $NAMESPACES$ */
bar.push({ scriptC: scriptC, foobar: foobar, });


console.log('This line should be executed at the end of import.');
