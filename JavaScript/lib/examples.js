#!/usr/bin/env node

/******************************************
 * UxADT Examples
 *
 * Chris Kuech
 * kuech@bu.edu
 * 4/23/2015
 *
 * UxADT adds support for algebraic data types to the host 
 * language using the host language's native constructs.  
 * The library supports definitions of both strongly-typed 
 * datatypes and untyped constructor
 */


// uxadt.js works on Node.js and browsers
var uxadt = require('./uxadt.js');


// UxADT wildcard value is null
var _ = null; 


// logs assertions
var _tests = [0, 0, 0, 0, 0];
function test(section, bool) {
  var i = section - 1;
  _tests[i] += 1;
  if (bool) {
    console.log("    Test "+section+"."+_tests[i]+" passed");
  } else {
    console.log("!!! Test "+section+"."+_tests[i]+" failed");
  } 
}











/**
 * 1. Untyped Values
 */


var env = {};


// define constructors List and Empty in env
// if env isn't specified, global/window is used
uxadt.def(env, {
  List: [_,_], // List takes two arguments of any type
  Empty: []
})


// computes the size of the list using the functional 
// pattern matching interface
function size_functional(list) {
  return list
    ._(env.List(_,_), function (x, xs) {
        // list matched pattern env.List(_,_)
        return 1 + size_functional(xs);
      })
    ._(env.Empty(), function () {
        // list matched pattern env.Empty()
        return 0;
      })
    .end;
}


// computes the size of the list using the imperative
// pattern matching interface
function size_imperative(list) {
  if (list._(env.List(_,_))) {
    var xs = list.matchedo()[1]; // second wildcard match
    return 1 + size_imperative(xs);
  } else {
    return 0;
  }
}


// recursively converts an array to a List
function arrayToList(arr, i) {
  i = i || 0;
  return i < arr.length
           ? env.List(arr[i], arrayToList(arr, i+1))
           : env.Empty();
}


// maps a list by function f
function listMap(list, f) {
  return list
    ._(env.List(_,_), function (x, xs) {
        return env.List(f(x), listMap(xs, f));
      })
    ._(env.Empty(), function () {
        return env.Empty();
      })
    .end;
}


var a = env.List(1, env.List(2, env.List(3, env.Empty())));
var b = arrayToList([1, 2, 3]);
test(1, a.equal(b));
test(1, size_functional(a) === 3);
test(1, size_imperative(a) === 3);















/**
 * 2. Basic Typed Values
 */


// defines constructors Node and Leaf of type Tree
// we left out the first argument "env", so the constructors
// are introduced into the global scope
uxadt.tdef("Tree", {
  Node: ["Tree", "Tree"], // capitalized strings represent types
  Leaf: ["#"] // "#" represent the type of native numbers 
})


// computes the minimum height of the tree
function minheight(tree) {
  return tree
    // typed pattern matching follows the same interface as untyped,
    // but infers types and asserts type equality
    ._(Node(_,_), function (a,b) {
        return 1 + Math.min(minheight(a), minheight(b));
      })
    ._(Leaf(_), function (x) {
        return 1;
      })
    .end;
}


var tree = Node(Node(Node(Node(Leaf(5), Leaf(5)), Node(Leaf(5), Leaf(5))), Leaf(4)), Node(Leaf(3), Leaf(3)));
test(2, minheight(tree) === 3);















/**
 * 3. Parametric Typed Values
 */


// defines a constructor `Tuple` of type `Tuple` in the global scope
// The type and constructors are introduced into separate namespaces,
// so there is no conflict.
// An argument list of lowercase names introduces type variables into
// the definition scope.
uxadt.tdef("Tuple(a,b)", {
  Tuple: ["a", "b"]
})


// defines constructors `Map` and `Empty` of type `Map` in the global scope.
uxadt.tdef("Map(k,v)", {
  Map: ["Tuple(k,v)", "Map(k,v)"], // these fields, at runtime, must have
                      // matching argument lists or there will be a Type Error
  Empty: []
});


// returns map[k]
function get(map, k) {
  return map
    ._(Map(Tuple(_,_),_), function (k0, v0, xs) {
        return k === k0 ? v0 : get(xs, k);
      })
    ._(Empty(), function () {
        throw "Not Found";
      })
    .end;
}


// converts a native object to a Map
function objToMap(o, ks) {
  ks = ks || Object.keys(o);
  if (ks.length) {
    var k = ks.pop();
    return Map(Tuple(k, o[k]), objToMap(o, ks));
  } else {
    return Empty();
  }
}


var map = objToMap({a:1,b:2,c:3});
var a = arrayToList([get(map, 'a'), get(map, 'b'), get(map, 'c')]);
test(3, a._(b));











/**
 * 4. Errors
 */


try {

  var map = objToMap({"fear_":"yes_","pi_":3.14}); // throws a uxadt.TypeError during inference

} catch (e) {
  // uxadt uses two kinds of errors, that are exposed for error handling

  // uxadt.TypeError is used for errors in type declaration and inference
  test(4, e instanceof uxadt.TypeError);

  // uxadt.Error is the base error used for any error in uxadt
  test(4, e instanceof uxadt.Error);

}










/**
 * 5. Pattern Matching and Substitutions
 */


// these are the pattern constants in uxadt
var wildcard = _ = null;
var numcard = "#";
var strcard = "$";

// check type of x using Tuple as a generic container
var isNum = function (x) { return Tuple(x,_)._(Tuple(numcard,_)); };
var isStr = function (x) { return Tuple(x,_)._(Tuple(strcard,_)); };
var isAny = function (x) { return Tuple(x,_)._(Tuple(_      ,_)); };

var explicit = {};


// declares a type Map with constructors `Map` and `Empty` in `explicit`
uxadt.tdef(explicit, "Map", {
  "Map": ["Tuple($,#)", "Map"], // Only maps strings to numbers
  "Empty": []
});


// get function for explicit.Map
explicit.get = function (map, k) {
  return map
    ._(explicit.Map(Tuple("$","#"),"xs"), function (k0, v0) {
        // card and variable matches are passed to the function and 
        // accessible in map.matchedo()
        for (var i = 0; i < map.matchedo().length; i++)
          console.log(map.matchedo()[i] === arguments[i]); // true
        // named variable matches can be accessed with map.matchedn()
        var xs = map.matchedn()["xs"];
        console.log( map.matchedo()[2]._(xs) ); // true
        return k === k0 ? v0 : explicit.get(xs, k);
      })
    ._(explicit.Empty(), function () {
        throw "Not Found";
      })
    .end;
}


// converts a native object to an explicit.Map
explicit.objToMap = function (o, ks) {
  ks = ks || Object.keys(o);
  if (ks.length) {
    var k = ks.pop();
    return Map(Tuple(k, o[k]), objToMap(o, ks));
  } else {
    return Empty();
  }
}


var map = objToMap({a:1,b:2,c:3});
var a = arrayToList([get(map, 'a'), get(map, 'b'), get(map, 'c')]);
test(5, a._(b));








