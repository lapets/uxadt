


// use _ as a synonym for wildcard pattern matching
var _ = uxadt.wildcard;

// enable typechecking
uxadt.typechecking = true;







/*******************************
 *
 * Example constructors
 *
 *******************************/

// The Number and String objects are themselves types
var StringListCons = {
  'Node': [String, 'StringList'],
  'Empty': []
};

// Generic types are defined with
// an argument list of types
var GenericTreeCons = {
  'Node': ['Tree(a)', 'Tree(a)'],
  'Leaf': ['a']
};

// Will throw error if typeName does not
// end with '(a, b)'
var TupleCons = {
  'Tuple': ['a', 'b']
};

// Type names must be capitalized while wildcard types
// must be lowercase
var GenericMapCons = {
  'Node': ['Tuple(a,b)', 'GenericMap(a,b)'],
  'Empty': []
};





/*******************************
 *
 * Unqualified Type Definitions
 *
 *******************************/

// uxadt._ is a convenience method for uxadt.unqualified
// by default but can be overwritten
uxadt._ = uxadt.unqualified;

// no type checking
uxadt.unqualified(constructors);

// alias for uxadt.qualified(typeName, constructors)
uxadt.unqualified(typeName, constructors);

// same as uxadt.qualified(typeName, constructors)
// but types are introduced into object instead of window/global
uxadt.unqualified(object, typeName, constructors);





/*******************************
 *
 * Qualified Type Definitions
 *
 *******************************/

// Type typeName is introduced into window/global
uxadt.qualified(typeName, constructors);

// no type checking
uxadt.qualified(constructors);






/*******************************
 *
 * Using pattern matching in functions
 *
 *******************************/

function stringListGet(l, i) {
  return l
    ._(StringList.Empty(), function () {
        return null;
      })
    ._(StringList.Node(_,_), function (x, xs) {
        if (i > 0) {
          return listGet(xs, i - 1);
        } else if (i === 0) {
          return x;
        } else {
          throw 'listGet - index out of bounds';
        }
      })
    .end;
}

function stringListToArray(l) {
  return l
    ._(StringList.Node(_,_), function (x, xs) {
        return [x].concat(stringListToArray(xs));
      })
    ._(StringList.Empty(), function () {
        return [];
      })
    .end;
}

function genericMapGet(m, k, ktype) {
  var M = GenericMap(ktype);
  return m
    ._(M.Node(Tuple(_,_),_), function (tmatch, ts) {
        var k0 = tmatch[0], v = tmatch[1];
        if (uxadt.eq(k0, k)) {
          return v;
        } else {
          return genericMapGet(ts, k, ktype);
        }
      })
    ._(M.Empty(), function () {
        return null;
      })
    .end;
}




//eof
