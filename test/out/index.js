// NAMESPACE START  --------------------
var home = new Namespace('home');

title = 'Homepage';
subtitle = 'This is a homepage';
$name = 'Nanang Mahdaen El Agung';

if ($name === 'Nanang Mahdaen El Agung') {
    $name = 'John Smith';
}

var a = 1, b = 2;

var w = (a == 1 ? 10 : 12);

home.push({ title: title, subtitle: subtitle, $name: $name, $name: $name, a: a, b: b, w: w, });
// NAMESPACE END    --------------------

// NAMESPACE START  --------------------
var about = new Namespace('about');

title = 'About Page';
subtitle = 'This is a About Page';

var overview = {
    a: 1,
    b: 2,
    c: 3
};

about.push({ title: title, subtitle: subtitle, overview: overview, });
// NAMESPACE END    --------------------


/* Test Global Var */
console.log(title);

/* Test private var */
console.log(home.title, home.$name);
console.log(about.title);

/* Test Namespace Object */
console.log(home);
console.log(about);