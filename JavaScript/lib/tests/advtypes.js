
var uxadt = require("../uxadt.js");

var _ = null;

function assert(bool, message) {
  if (!bool)
    throw new Error(message || "");
}


///////////////////////////////////////


uxadt.tdef("Tuple(a,b)", {
  "Tuple": ["a", "b"]
});

uxadt.tdef("Map(k,v)", {
  "Map": ["Tuple(k,v)", "Map(k,v)"],
  "Empty": []
});


function contains(map, k) {
  return map
    ._(Map(Tuple(_,_),_), function (k0, v0, xs) {
        return k === k0 || contains(xs, k);
      })
    ._(Empty(), function () {
        return false;
      })
    .end;
}


function get(map, k) {
  return map
    ._(Map(Tuple(_,_),_), function (k0, v0, xs) {
        return k === k0 ? v0 : get(xs, k);
      })
    ._(Empty(), function () {
        return false;
      })
    .end;
}


function set(map, k, v) {
  return map
    ._(Map(Tuple(_,_),_), function (k0, v0, xs) {
        return k === k0 
                  ? Map(Tuple(k,v), xs)
                  : Map(Tuple(k0,v0), set(xs, k, v));
      })
    ._(Empty(), function () {
        return Map(Tuple(k, v), Empty());
      })
    .end;
}


function objToMap(o) {
  return (function recurse(ks) {
      if (!ks.length) {
        return Empty();
      } else {
        var k = ks.shift();
        var v = o[k];
        return Map(Tuple(k,v), recurse(ks));
      }
    })(Object.keys(o));
}


function mapToObj(map) {
  return map
    ._(Map(Tuple(_,_),_), function (k, v, xs) {
        var o = mapToObj(xs);
        o[k] = v;
        return o;
      })
    ._(Empty(), function () {
        return {};
      })
    .end;
}



///////////////////////////////////////




var o = mapToObj(objToMap({a_:1,b_:2,c_:3}));
var map = objToMap(o);
map = set(map, "d_", 4);
assert(get(map, "b_") === 2);
assert(contains(map, "d_"));


(function () {
  var flag = false;
  try {
    map = set(map, 4, 5);
  } catch (e) {
    flag = true;
  }
  assert(flag, "No type error was thrown!");
})();


(function () {
  var flag = false;
  try {
    map = set(map, "c_", "h_");
  } catch (e) {
    flag = true;
  }
  assert(flag, "No type error was thrown!");
})();









