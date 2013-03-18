////////////////////////////////////////////////////////////////
//
// uxadt.js
// Module for building and matching algebraic data type
// instances.
//

////////////////////////////////////////////////////////////////
// Module definition.

var uxadt = (function(){
  var uxadt = {};

  // Build a string representation of an instance.
  uxadt.toString = function (i) {
    var inst = i;
    if (inst.uxadt == null)
      return "";
    if (inst.uxadt.t == 'v')
      return i.uxadt.v;
    if (inst.uxadt.t == 'c') {
      var tmp = inst.uxadt.c
      if (inst.uxadt.d.length != null && inst.uxadt.d.length > 0) {
        tmp = tmp + "(";
        for (var i = 0; i < inst.uxadt.d.length; i++) {
          if (i > 0)
            tmp = tmp + ", ";
          tmp = tmp + inst.uxadt.d.toString();
        }
        tmp = tmp + ")";
      }
      return tmp;
    }
    return null;
  };

  // Build an instance by using a constructor.
  uxadt.C = function (c, d) {
    return {uxadt: {t: 'c', c: c, d: d, toString: uxadt.toString}};
  };

  // Build a pattern variable instance.
  uxadt.V = function (v) {
    return {uxadt: {t: 'v', v: v, toString: uxadt.toString}};
  };

  // Match an instance to a pattern and return
  // a map if possible, or null otherwise.
  uxadt.M = function (i, p) {
    
    // Private recursive implementation.
    function match (i, p) {
    
    }
  
    var map = {};
    
    
    return map;
  };

  return uxadt;
})();

// eof
