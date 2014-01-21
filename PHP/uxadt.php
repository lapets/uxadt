<?php /**************************************************************
** 
** uxadt.php
**
**   A library that supports a universal, cross-platform embedded
**   representation for algebraic data type (ADT) values, and a
**   programming abstraction for operations (such as pattern
**   matching) on algebraic data type values.
**
**   Web:     uxadt.org
**   Version: 0.0.0.2
**
*/

/////////////////////////////////////////////////////////////////////
// Representation for individual algebraic data type values and
// patterns.

class Value {

  // Structural equality.
  function equal($that) {
    foreach (get_object_vars($this) as $c => $cc) {
	  foreach (get_object_vars($that) as $d => $dd) {
        if ($c == $d && count($cc) == count($dd)) {
	      for ($i = 0; $i < count($cc); $i++)
		    if (!($cc[$i]->equal($dd[$i])))
			  return 0;
          return 1;
	    } else
	      return 0;
      }
	}
    return 0;
  }

  // Matching function.
  function match ($p, $f) {
    $subst = uxadt::unify($p, $this);
    return new Matching($this, (!is_array($subst)) ? null : call_user_func_array($f, $subst));
  }

  // Matching function (concise synonym).
  function _ ($p, $f) {
    $subst = uxadt::unify($p, $this);
    return new Matching($this, (!is_array($subst)) ? null : call_user_func_array($f, $subst));
  }
}

/////////////////////////////////////////////////////////////////////
// Representation for state of matching computations.

class Matching {

  public $candidate = null;
  public $end = null;

  function Matching($candidate, $end = null) {
    if ($end == null)
	  $this->candidate = $candidate;
	else
      $this->end = $end;
  }

  // Matching function.
  function match ($p, $f) {
    return ($this->candidate == null) ? new Matching(null, $this->end) : $this->candidate->match($p, $f);
  }
  
  // Matching function (concise synonym).
  function match ($p, $f) {
    return ($this->candidate == null) ? new Matching(null, $this->end) : $this->candidate->match($p, $f);
  }
}

/////////////////////////////////////////////////////////////////////
// Container class for library.

class uxadt {

  const _ = null;

  static function constructor($name) {
    return
      function () use ($name) {
	    $args = func_get_args();
        $value = new Value;
        $value->$name = $args;
        return $value;
      };
  }

  // Pattern matching unification algorithm.
  static function unify($p, $v) {
    if (!($p instanceof Value) || $p == uxadt::_)
	  return array($v);

    foreach (get_object_vars($p) as $c => $cc) {
	  foreach (get_object_vars($v) as $d => $dd) {
	    if ($c == $d && count($cc) == count($dd)) {
		  $substs = array();
		  for ($i = 0; $i < count($cc); $i++) {
		    $subst = uxadt::unify($cc[$i], $dd[$i]);
		    if ($subst == null)
			  return null;
		    $substs = array_merge($substs, $subst);
	      }
		  return $substs;
	    } else
		  return null;
      }
	}
    return null;
  }

  static function definition($sigs) {

    // Since emitted code will refer to uxadt operations
	// by name, the object must be defined in the scope.
    $definition =
	    "if (!(class_exists('uxadt')))"
	  . "throw new ErrorException('UxADT error: identifier uxadt must be defined');";

    foreach ($sigs as $con => $args) {
      if (count($args) > 0) {
        //$definition .= '$' . $con." = uxadt::constructor('".$con."'); ";
	    $definition .= 'function '.$con.' () { $v = new Value; $v->'.$con.' = func_get_args(); return $v; };';
	  }   else {
	    //$definition .= '$' . $con . ' = uxadt::value("'.$con.'");';
	    $definition .= 'function '.$con.' () { $v = new Value; $v->'.$con.' = array(); return $v; };';
	  }
    }
    return $definition;
  }
}

/////////////////////////////////////////////////////////////////////
// Useful global synonyms.

if (!defined('_')) define('_', uxadt::_);

/////////////////////////////////////////////////////////////////////
// Examples.

eval(uxadt::definition(array(
    'Node' => array(_, _),
	'Leaf' => array()
  )));

$x = Node(Node(Leaf(), Leaf()), Leaf());
$y = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()));
$z = Leaf();

function nodes($t) {
  return $t
    ->match(Leaf(), function() { 
	    return 1; 
      })
    ->match(Node(_, _), function($x, $y) {
	    return 1 + nodes($x) + nodes($y);
      })
    ->end;
}

echo nodes($x);

?>