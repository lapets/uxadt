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
    if (Object.prototype.toString.call(inst) === '[object Array]') {
      var list = "";
      for (var k = 0; k < inst.length; k++)
        list += (k>0?", ":"") + uxadt.toString(inst[k]);
      return "[" + list + "]";
    } else if (inst.uxadt == null) {
      return inst.toString();
    } else if (typeof inst === 'string') {
      return '"' + inst + '"';
    } else if (typeof inst.uxadt === 'string') {
      return inst.uxadt;
    } else {
      for (var c in inst.uxadt) { // Only to extract key.
        var data = inst.uxadt[c], args = "";
        if (data.length != null && data.length > 0) {
          for (var k = 0; k < data.length; k++) {
            var arg = uxadt.toString(data[k]);
            args += (arg==null?"":((k>0?", ":"")+arg));
          }
        }
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
    var map = {};

    // uxadt variable matched to array or string.
    if (typeof pattern.uxadt === 'string') {
      if (typeof inst === 'string') {
        map[pattern.uxadt] = inst;
        return map;
      }
      if (Object.prototype.toString.call(inst) === '[object Array]') {
        map[pattern.uxadt] = inst;
        return map;
      }
    }

    // If pattern is an array.
    if (Object.prototype.toString.call(pattern) === '[object Array]') {
      if (Object.prototype.toString.call(inst) === '[object Array]') {
        return uxadt.match(uxadt.C("@", inst), uxadt.C("@", pattern));
      }
    }

    // Neither is a uxadt object.
    if (inst.uxadt == null || pattern.uxadt == null)
      return null;

    // Both are uxadt objects.
    if (typeof pattern.uxadt === 'string') {
      var v = pattern.uxadt;
      map[v] = inst;
      return map;
    } else {
      for (var ci in inst.uxadt) { for (var cp in pattern.uxadt) { 
        if (ci == cp) {
          if (inst.uxadt[ci].length != pattern.uxadt[cp].length)
            return null;
          if (inst.uxadt[ci].length == 0)
            return map;
          for (var k = 0; k < inst.uxadt[ci].length; k++) {
            var tmp = uxadt.match(inst.uxadt[ci][k], pattern.uxadt[cp][k]);
            if (tmp == null)
              return null;
            for (var v in tmp) {
              if (map[v] != null) { // No match if variable is already matched.
                return null;
              } else {
                map[v] = tmp[v];
              }
            }
          }
          return map;
        }
      }}
    }
    return null;
  };
  
  // Concise method synonyms.
  uxadt.C = uxadt.constructor;
  uxadt.V = uxadt.variable;
  uxadt.M = uxadt.match;
  uxadt.N = null;
  uxadt.None = uxadt.N;

  return uxadt;
})();

// eof
