/********************************************************************
** 
** uxadt.js
**
**   A library that supports a universal, cross-platform embedded
**   representation for algebraic data type (ADT) values, and a
**   programming abstraction for operations (such as pattern
**   matching) on algebraic data type values.
**
**   Web:     uxadt.org
**   Version: 0.0.3
**
*/

(function (_, uxadt) {

  // "use strict";

  /******************************************************************
  ** Data structure for maintaining the state of a chained matching
  ** expression. It must support the same matching interface as the
  ** one supported by values.
  */

  // Constructor.
  uxadt.Matching = 
    function (candidate, end) {
      if (end == null)
        this.candidate = candidate;
      else
        this.end = end;
    };

  // Matching function.
  uxadt.Matching.prototype.match =
    function (p, f) {
      return (this.candidate == null) ? uxadt.Matching(null, this.end) : this.candidate.match(p, f);
    };
  uxadt.Matching.prototype._ = uxadt.Matching.prototype.match;

  /******************************************************************
  ** Every UxADT value (i.e., instance of a data structure) and every
  ** UxADT pattern is represented as a Value object.
  */

  // Constructor.
  uxadt.Value =
    function(cons) {
      this.__at__ = {};
      this.__last__ = null;

      for (var con in cons)
        this[con] = cons[con];
    };

  // Structural equality.
  uxadt.Value.prototype.equal =
    function (that) {
      // If we are using stateful match storage, clean up
      // in case there is anything left over.
      this.__last__ = null;

      // Compare the constructors and recursively check equality.
      for (var c in this) {
        for (var d in that) {
          if ( !(c in uxadt.Value.prototype) && !(d in uxadt.Matching.prototype)
            && (c[0]!='_' && (c.length<2 || c[1]!='_') && d[0]!='_' && (d.length<2 || d[1]!='_'))
             ) {
            if (c == d && this[c].length == that[d].length) {
              for (var i = 0; i < this[c].length; i++)
                if (!(uxadt.Value.prototype.equal(this[c][i], that[d][i])))
                  return false;
              return true;
            } else {
              return false;
            }
          }
        }
      }
      return false; // Failure.
    };

  // Pattern matching unification algorithm.
  uxadt.Value.prototype.unify =
    function (p, v) {
      if (!(p instanceof uxadt.Value) || p == null)
        return [v];

      // Compare the constructors and recursively unify if they match.
      for (var c in p) {
        for (var d in v) {
          if ( !(c in uxadt.Value.prototype) && !(d in uxadt.Matching.prototype)
            && (c[0]!='_' && (c.length<2 || c[1]!='_') && d[0]!='_' && (d.length<2 || d[1]!='_'))
             ) {
            if (c == d && p[c].length == v[d].length) {
              var substs = [];
              for (var i = 0; i < p[c].length; i++) {
                var subst = uxadt.Value.prototype.unify(p[c][i], v[d][i]);
                if (subst == null)
                  return null;
                substs = substs.concat(subst);
              }
              return substs;
            } else {
              return null;
            }
          }
        }
      }
      return null;
    };

  // Matching function.
  uxadt.Value.prototype.match =
    function (p, f) {
      // If we are using stateful match storage, clean up
      // in case there is anything left over.
      this.__last__ = null;
    
      var subst = uxadt.Value.prototype.unify(p, this);
      if (f == null) {
        if (subst != null && subst.length > 0)
          this.__last__ = subst;
        return subst != null;
      } else {
        return new uxadt.Matching(this, (subst == null) ? null : f.apply(f, subst));
      }
    };
  uxadt.Value.prototype._ = uxadt.Value.prototype.match;

  // Last match retrieval when using stateful matching.
  uxadt.Value.prototype.matched =
    function matched() {
      if (this.__last__ != null) {
        var tmp = this.__last__;
        this.__last__ = null;
        return tmp;
      }
      // throw error ('UxADT error: can only traverse result of match exactly once after a match has occurred.');
    };

  // Setting and getting labeled projections.
  uxadt.Value.prototype.at =
    function () {
      if (arguments.length == 1) {
        var label = arguments[0];
        return this.__at__[label] != null ? this.__at__[label] : null;
      } else if (arguments.length == 2) {
        var label = arguments[0], proj = arguments[1];
        this.__at__[label] = proj;
        return this;
      }
      return this;
    };

  // Rendering as a native nested data structure.
  uxadt.Value.prototype.toData =
    function () {
      var s = "";
      var ss = [];
      for (c in this) {
        if (!(c in uxadt.Value.prototype) && (c[0]!='_' && (c.length<2 || c[1]!='_'))) {
          for (var i = 0; i < this[c].length; i++)
            ss.push(this[c].toData());
          var o = {};
          o[c] = ss;
          return o;
        }
      }
    };

  // Rendering as a string.
  uxadt.Value.prototype.toString =
    function () {
      var s = "";
      for (c in this) {
        if (!(c in uxadt.Value.prototype) && (c[0]!='_' && (c.length<2 || c[1]!='_'))) {
          s = c + '(';
          for (var i = 0; i < this[c].length; i++)
            s = s + (i > 0 ? ', ' : '') + this[c][i].toString();
          return s + ')';
        }
      }
    };
  
  /******************************************************************
  ** Functions for defining algebraic data type constructors. There
  ** are two ways techniques supported for introducing constructors:
  **  * defining them in the local scope as stand-alone, unqualified
  **    functions by passing the definition string to eval();
  **  * defining a named class or object that has the named 
  **    constructors as its only methods.
  */

  uxadt.unqualified =
    function (sigs) {
      // Since emitted code will refer to UxADT operations
      // by name, the module must be defined in the scope.
      var defs =
          "if (typeof uxadt.Value === 'undefined') "
        + "throw '"
        + "UxADT error: module cannot be found in the scope."
        + "Please ensure that the module is being imported correctly."
        + "';";
      defs = '';
      for (con in sigs)
        defs = defs + con + ' = function() { var v = new uxadt.Value(); value["' + con + '"] = arguments; return v; };';
      return defs;
    };
  
  uxadt.qualified =
    function (arg1, arg2) {
    
    };

  /*
  // Function for introducing a new algebraic data type
  // (can introduce constructors into specified scope).
  uxadt.definition = function () {
    var cases, obj;
    if (arguments.length == 1) {
      // Build a string to use with eval().
      obj = "";
      cases = arguments[0];
      for (var con in cases)
        obj += con + "=uxadt.constructor(con);";
    } else if (arguments.length == 2) {
      // Define constructors as members of the supplied object.
      obj = arguments[0];
      cases = arguments[1];
      for (var con in cases)
        obj[con] = (cases[con].length == 0) ? uxadt.constructor(con) : uxadt.constructor(con);
    }

    return obj;
  }
  */

  uxadt.definition = uxadt.unqualified;
  uxadt._ = uxadt.unqualified;

})(typeof exports !== 'undefined' ? exports : (this.uxadt = {}));
/* eof */