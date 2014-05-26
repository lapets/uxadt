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

  "use strict";

  // Wildcard pattern is _.
  uxadt._ = _;

  // Representation for individual algebraic data type values
  // and value patterns.
  uxadt.Value = function() {};

  // Pattern matching unification algorithm.
  uxadt.unify = 
    function (p, v) {
      if (p == uxadt._)
        return [v];

      for (var c in p) {
        for (var d in v) {
          if ( !(c in uxadt.Value.prototype) 
            && !(d in uxadt.Match.prototype) 
            && c == d 
            && p[c].length == v[d].length
             ) {
            var substs = [];
            for (var i = 0; i < p[c].length; i++) {
              var subst = uxadt.unify(p[c][i], v[d][i]);
              if (subst == null)
                return null;
              substs = substs.concat(subst);
            }
            return substs;
          }
        }
      }
      return null; // Failure.
    }

  // Constructor and interface for pattern matching results.
  uxadt.Match = 
    function (value) {
      this.isMatch = true;
      this.end = value;
    };

  uxadt.Match.prototype.match =
    function (p, f) {
      return this;
    }
  uxadt.Match.prototype._ = uxadt.Match.prototype.match;

  // Interface for matching algebraic data type values.
  uxadt.Value.prototype.match =
    function (p, f) {
      var subst = uxadt.unify(p, this);
      return (subst != null) ? new uxadt.Match(f.apply(f, subst)) : this;
    }
  uxadt.Value.prototype._ = uxadt.Value.prototype.match;

  // Algebraic data type value constructor.
  uxadt.constructor = function (name) {
    return (
        function () {
          var value = new uxadt.Value();
          value[name] = [];
          for (var i = 0; i < arguments.length; i++)
            value[name].push(arguments[i]);
          return value;
        }
      );
  }

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

  uxadt.define = uxadt.definition;

//})(typeof exports !== 'undefined' ? exports : (this.uxadt = {}));
//})(this.uxadt = (function(){}));
})(_, this.uxadt = 

  // Extensions on existing prototypes for handling common operations
  // on container types that may hold UxADT Values.

  function __uxadt__(obj) {

    // Return a new, wrapped object on which UxADT functions are defined.
    var self = this;
    obj = obj == null ? self : obj;

    // Apply the function to the first element in an array that matches
    // the specified pattern (i.e., a 'find' operation) and returns a
    // non-null result value.
    obj.find =
      function (p, f) {
        for (var i = 0; i < obj.length; i++) {
          var value = obj[i]._(p, f).end;
          if (value != null)
            return value;
        }
        return null;
      };

    // Return a new array containing the NON-NULL results of applying 
    // the specified function to each element in the input array that
    // matches the specified pattern (i.e., a 'filter' operation
    // and a 'map' operation).
    obj.map =
      function (p, f) {
        var a = [];
        for (var i = 0; i < obj.length; i++) {
          var value = obj[i]._(p, f).end;
          if (value != null)
            a.push(value);
        }
        return uxadt(a);
      };

    return obj;
  }
);

/////////////////////////////////////////////////////////////////////
// Useful global synonyms.

if (typeof _ == 'undefined')
  var _ = null;

/*
// Example.
function hgt(t) {
  return t
     ._(Leaf(), function(){
          return 1;
       })
     ._(Node(_, _), function(x, y){
          return hgt(x) + hgt(y);
       })
     .end;
}*/

/* eof */