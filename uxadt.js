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

  // Build an instance by using a constructor.
  uxadt.C = function (c, d) {
    return {uxadt: {t: 'c', c: c, d: d}};
  };

  // Build a pattern variable instance.
  uxadt.V = function (v) {
    return {uxadt: {t: 'v', v: v}};
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
