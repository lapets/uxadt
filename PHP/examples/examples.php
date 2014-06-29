<?php /**************************************************************
**
** examples.php
**
**   Small examples that illustrate how the uxadt.py module can be
**   used.
**
*/

include "uxadt.php";
define('_', null);

/********************************************************************
** Defining constructors in the local scope as stand-alone functions.
*/

\uxadt\_(array(
    'Red' => array(),
    'Blue' => array()
  ));

/* The algebraic data type name is optional; the first argument
   can be the type name, or it can be the array defining the
   constructors:
   
\uxadt\_('Tree', array(
    'Node' => array('Tree', 'Tree'),
    'Leaf' => array()
  ));

\uxadt\_(array(
    'Node' => array(_, _),
    'Leaf' => array()
  ));
 */

\uxadt\_('Tree', array(
    'Node' => array('Tree', 'Tree'),
    'Leaf' => array()
  ));

$c0 = Red();
$t0 = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()));
$t1 = Leaf();
$t2 = Node(Node(Leaf(), Leaf()), Leaf());

function size($t) {
  return $t
    ->_(Leaf(),     function()       { return 1;  })
    ->_(Node(_, _), function($x, $y) { return 1 + size($x) + size($y); })
    ->end;
}

print "Example #1\n";
print $t0 . "\n";
print_r($t0->toData()); print "\n";
$t0 = $t0->at('size', size($t0));
print $t0->at('size') . "\n";
print "\n";

/********************************************************************
** Using alternate interface for pattern matching.
*/

function width($t) {
  if ($t->_(Leaf())) {
    return 1;
  } else if ($t->_(Node(_, _))) {
    list($x, $y) = $t();
    return width($x) + width($y);
  }
}

print "Example #2\n";
print $t0 . " has width " . width($t0) . ".\n";
print "\n";

/********************************************************************
** Defining name-qualified constructors.
*/

$Color = \uxadt\qualified('Color', array(
    'Red' => array(),
    'Blue' => array()
  ));

\uxadt\qualified('Tree', array(
    'Node' => array(_, _),
    'Leaf' => array()
  ));

$c0 = $Color->Red();
$t0 = Tree::Node(Tree::Node(Tree::Leaf(), Tree::Leaf()), Tree::Node(Tree::Leaf(), Tree::Leaf()));

function height($t) {
  if ($t->_(Tree::Leaf())) {
    return 0;
  } else if ($t->_(Tree::Node(_, _))) {
    list($x, $y) = $t();
    return 1 + max(height($x), height($y));
  }
}

print "Example #3\n";
print $c0 . "\n";
print $t0 . " has height " . height($t0) . ".\n";
print "\n";

/********************************************************************
** Constructors wrapping values of other non-UxADT types.
*/

\uxadt\_(array(
    'Just' => array(_),
    'Nothing' => array()
  ));

function unwrap($m) {
  return $m->_(Just(_), function($x) { return $x; })->end;
}

print "Example #4\n";
print unwrap(Just(123)) . "\n";
print unwrap(Just('ABC')) . "\n";
print unwrap(Just(Just(array('a', 'b', 'c')))) . "\n";
print_r(Just(123)->toData()); echo "\n";
print_r(Just('ABC')->toData()); echo "\n";
print_r(Just(Just(array('a', 'b', 'c')))->toData()); echo "\n";
print "\n";

/*eof*/ ?>