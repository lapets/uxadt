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
**   Version: 0.0.16.0
**
*/

namespace uxadt;

/********************************************************************
** Data structure for maintaining the state of a chained matching
** expression. It must support the same matching interface as the
** one supported by values.
*/

class Matching {
  public $candidate = null;
  public $end = null;

  // Constructor.
  public function __construct($candidate, $end = null) {
    if ($end == null)
      $this->candidate = $candidate;
    else
      $this->end = $end;
  }

  // Matching function.
  public function _($p, $f) { return $this->match($p, $f); }
  public function match($p, $f) {
    return ($this->candidate == null) ? new Matching(null, $this->end) : $this->candidate->match($p, $f);
  }
}

/********************************************************************
** Every UxADT value (i.e., instance of a data structure) and every
** UxADT pattern is represented as a Value object.
*/

class Value {
  private $__ty__ = null;
  private $__at__ = array();
  private $__last__ = null;

  // Constructor.
  public function __construct($sigs, $ty = null) {
    foreach ($sigs as $con => $args)
      $this->$con = $args;
    $this->__ty__ = $ty;
  }

  // Structural equality.
  function equal($that) {
    // If we are using stateful match storage, clean up
    // in case there is anything left over.
    $this->__last__ = null;

    // Compare the constructors and recursively check equality.
    foreach (get_object_vars($this) as $c => $cc) {
      foreach (get_object_vars($that) as $d => $dd) {
        if ($c[0]!='_' && (strlen($c)<2 || $c[1]!='_') && $d[0]!='_' && (strlen($d)<2 || $d[1]!='_')) {
          if ($c == $d && count($cc) == count($dd)) {
            for ($i = 0; $i < count($cc); $i++)
              if (!($cc[$i]->equal($dd[$i])))
                return 0;
            return 1;
          } else {
            return 0;
          }
        }
      }
    }
    return 0; // Failure.
  }

  // Pattern matching unification algorithm.
  static function unify($p, $v) {
    if (!($p instanceof Value) || $p == null)
      return array($v);

    // Compare the constructors and recursively unify if they match.
    foreach (get_object_vars($p) as $c => $cc) {
      foreach (get_object_vars($v) as $d => $dd) {
        if ($c[0]!='_' && (strlen($c)<2 || $c[1]!='_') && $d[0]!='_' && (strlen($d)<2 || $d[1]!='_')) {
          if ($c == $d && count($cc) == count($dd)) {
            $substs = array();
            for ($i = 0; $i < count($cc); $i++) {
              $subst = Value::unify($cc[$i], $dd[$i]);
              if (!is_array($subst))
                return null;
              $substs = array_merge($substs, $subst);
            }
            return $substs;
          } else {
            return null;
          }
        }
      }
    }
    return null;
  }

  // Matching function.
  function _($p, $f = null) { return $this->match($p, $f); }
  function match($p, $f = null) {
    // If we are using stateful match storage, clean up
    // in case there is anything left over.
    $this->__last__ = null;

    $subst = Value::unify($p, $this);
    if ($f == null) {
      if (is_array($subst) && count($subst) > 0)
        $this->__last__ = $subst;
      return is_array($subst);
    } else {
      return new Matching($this, (!is_array($subst)) ? null : call_user_func_array($f, $subst));
    }
  }

  // Last match retrieval when using stateful matching.
  function __invoke() { return $this->matched(); }
  function matched() {
    if ($this->__last__ != null) {
      $tmp = $this->__last__;
      $this->__last__ = null;
      return $tmp;
    }
    throw new ErrorException('UxADT error: can only traverse result of match exactly once after a match has occurred.');
  }

  // Setting and getting labeled projections.
  function at () {
    $args = func_get_args();
    if (count($args) == 1) {
      $label = $args[0];
      return array_key_exists($label, $this->__at__) ? $this->__at__[$label] : null;
    } else if (count($args) == 2) {
      list($label, $proj) = $args;
      $this->__at__[$label] = $proj;
      return $this;
    }
    return $this;
  }

  // Rendering as a native nested data structure.
  public function toData() {
    $s = "";
    $ss = array();
    foreach (get_object_vars($this) as $c => $cc) {
      if ($c[0] != '_' && (strlen($c) < 2 || $c[1] != '_')) {
        for ($i = 0; $i < count($cc); $i++)
          array_push($ss, (is_a($cc[$i], '\uxadt\Value')) ? $cc[$i]->toData() : $cc[$i]);
        return array($c => $ss);
      }
    }
  }

  // Rendering as a string.
  static private function arrayToStringRecursive($xs) {
    // Handle arrays by emitting explicit "array()" calls.
    // TODO: Handle strings by escaping them properly and
    // emitting quotation delimiters.
    $ss = array();
    foreach ($xs as $x) {
      if (is_a($x, '\uxadt\Value'))
        array_push($ss, $x->toString());
      else if (is_string($x)) 
        array_push($ss, "'" . addslashes($x) . "'");
      else if (is_array($x))
        array_push($ss, arrayToStringRecursive($x));
      else
        array_push($ss, ''.$x);
    }
    return 'array(' . implode(", ", $ss) . ')';
  }
  public function __toString() { return $this->toString(); }
  public function toString() {
    $s = "";
    $ss = array();
    foreach (get_object_vars($this) as $c => $cc) {
      if ($c[0] != '_' && (strlen($c) < 2 || $c[1] != '_')) {
        $s = (($this->__ty__ != null) ? $this->__ty__ . '::' : '') . $c . '(';
        foreach ($cc as $v) {
          if (is_a($v, '\uxadt\Value'))
            array_push($ss, $v->toString());
          else if (is_string($v)) 
            array_push($ss, "'" . addslashes($v) . "'");
          else if (is_array($v))
            array_push($ss, Value::arrayToStringRecursive($v));
          else
            array_push($ss, ''.$v);
        }
        return $s . implode(", ", $ss) . ')';
      }
    }
  }
}

/********************************************************************
** Functions for defining algebraic data type constructors. There
** are two ways techniques supported for introducing constructors:
**  * defining them in the local scope as stand-alone, unqualified
**    functions by passing the definition string to eval();
**  * defining a named class or object that has the named 
**    constructors as its only methods.
*/

function unqualified($arg1, $arg2 = null) {
  // If a name was supplied explicitly as the first argument,
  // ignore it and use the second argument for the signatures.
  $sigs = ($arg2 === null) ? $arg1 : $arg2;

  // Since emitted code will refer to UxADT operations
  // by name, the module must be defined in the scope.
  $defs =
      "if (!(class_exists('\\uxadt\\Value')))"
    . "throw new ErrorException('"
    . "UxADT error: module cannot be found in the scope."
    . "Please ensure that the module is being imported correctly."
    . "');";

  // Define the constructors as unqualified globals.
  foreach ($sigs as $con => $args)
    $defs .= 'function '.$con.' () { $v = new \\uxadt\\Value(array("'.$con.'" => func_get_args())); return $v; };';
  eval($defs);
}

function qualified($arg1, $arg2 = null, $arg3 = null) {
  // There are three supported possibilities for supplied arguments:
  // * (<constructors>)
  // * (<qualifier>, <constructors>)
  // * (<namespace>, <qualifier>, <constructors>)
  // We handle each case separately.
  if ($arg2 === null && $arg3 === null) {
    $sigs = $arg1;
    $name = "_Type";
    $ns = "";
    foreach ($sigs as $con => $args)
      $name .= "_" . $con;
  } else if ($arg3 === null) {
    $sigs = $arg2;
    $name = $arg1;
    $ns = "";
  } else {
    $sigs = $arg3;
    $name = $arg2;
    $ns = $arg1;
  }

  $ns_decl = ($ns !== "") ? "namespace " . $ns . ";" : "";
  $ns = ($ns !== "") ? "\\" . $ns . "\\" : "";

  // Create the class that has the constructors as named static methods.
  $defs = $ns_decl . "class " . $name . "{ ";
  foreach ($sigs as $con => $args)
    $defs .= "public static function " . $con . "() { return new \\uxadt\\Value(array('" . $con . "' => func_get_args()), '" . $ns . $name . "'); } ";
  $defs .= ' };';

  // Make the named object of that class available in the global context and also return it.
  eval($defs);
  eval('$t = new ' . $ns . $name . '();');
  return $t;
}

// Synonyms for the default technique.
function definition($arg1, $arg2) { return unqualified($arg1, $arg2); }
function _($arg1, $arg2 = null) { return unqualified($arg1, $arg2); }

/*eof*/ ?>