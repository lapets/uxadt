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

eval(\uxadt\_(array(
    'Red' => array(),
	'Blue' => array()
  )));

eval(\uxadt\_(array(
    'Node' => array(_, _),
	'Leaf' => array()
  )));

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
$t0->at('size', size($t0));
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
** Defining a named object that has the constructors as its methods.
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

/*eof*/ ?>