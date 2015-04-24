
var uxadt = require("../uxadt.js");

var _ = null;


function assert(bool, message) {
  if (!bool)
    throw new Error(message || "");
}


function size(list) {
  return sum(map(list, function (x) {return 1;}));
}


function map(list, f) {
  return list
    ._(uxadt.List(_,_), function (x,xs) {
        return uxadt.List(f(x), map(xs, f));
      })
    ._(uxadt.Empty(), function () {
        return uxadt.Empty();
      })
    .end;
}


function sum(list) {
  return list
    ._(uxadt.List(_,_), function (x,xs) {
        return x + sum(xs);
      })
    ._(uxadt.Empty(), function () {
        return 0;
      })
    .end;
}


// var list = uxadt.List(1, uxadt.List(1, uxadt.List(1, uxadt.List(1, uxadt.List(1, uxadt.Empty())))));

assert(sum(uxadt.Empty()) === 0, "sum(Empty) =/= 0");
assert(sum(uxadt.List(4, uxadt.Empty())) === 4);
assert(sum(uxadt.List(3, uxadt.List(8, uxadt.Empty()))) === 11);




