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
  uxadt.toString = function (inst) {
    if (inst.uxadt == null)
      return inst.toString();
    else if (typeof inst.uxadt === 'string')
      return inst.uxadt;
    else {
      for (c in inst.uxadt) { // Only to extract key.
        var data = inst.uxadt[c], args = "";
        if (data.length != null && data.length > 0)
          for (var k = 0; k < data.length; k++)
            args = (k>0?", ":"") + args + uxadt.toString(data[k]);
        return c + (data.length > 0 ? "(" + args + ")" : "");
      }
    }
    return null;
  };

  // Build an instance by using a constructor.
  uxadt.constructor = function (c, d) {
    var inst = {};
    inst[c] = (d == null ? [] : d);
    return {uxadt: inst};
  };

  // Build a pattern variable instance.
  uxadt.variable = function (v) {
    return {uxadt: v};
  };

  // Match an instance to a pattern and return a map if possible,
  // or null otherwise. By default, any attempt to merge two maps
  // (from matched subtrees) with overlapping domains results in
  // a non-match (i.e., null).
  uxadt.match = function (inst, pattern) {
    if (inst.uxadt == null || pattern.uxadt == null)
      return null;
    var map = {};
    if (typeof pattern.uxadt === 'string') {
      var v = pattern.uxadt;
      map[v] = inst;
      return map;
    } else {
      for (ci in inst.uxadt) { for (cp in pattern.uxadt) { 
        if (ci == cp) {
          if (inst.uxadt[ci].length != pattern.uxadt[cp].length)
            return null;
          if (inst.uxadt[ci].length == 0)
            return map;
          for (var k = 0; k < inst.uxadt[ci].length; k++) {
            var tmp = uxadt.match(inst.uxadt[ci][k], pattern.uxadt[cp][k]);
            if (tmp == null)
              return null;
            for (v in tmp) {
              if (map[v] != null) // No match if variable is already matched.
                return null;
              else
                map[v] = tmp[v];
            }
            return map;
          }
        }
      }}
    }
    return null;
  };
  
  // Concise method synonyms.
  uxadt.C = uxadt.constructor;
  uxadt.V = uxadt.variable;
  uxadt.M = uxadt.match;

  return uxadt;
})();

// eof
