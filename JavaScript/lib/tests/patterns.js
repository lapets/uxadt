
var uxadt = require("../uxadt.js");

var _ = null;

function assert(bool, message) {
  if (!bool)
    throw new Error(message || "");
}



uxadt.tdef("List(a)", {
  "List": ["a", "List(a)"],
  "Empty": []
});


uxadt.tdef("Point", {
  "Point": ["#", "#"]
});


uxadt.tdef("Box", {
  "Box": ["Point", "Point", "Point", "Point"]
});


function arrToList(arr, i) {
  i = i || 0;
  return i < arr.length 
           ? List(arr[i], arrToList(arr, i+1)) 
           : Empty();
}


function sum(list) {
  return list
    ._(List("#",_), function (x,xs) {
        return x + sum(xs);
      })
    ._(Empty(), function () {
        return 0;
      })
    .end;
}


function mul(list) {
  return list
    ._(List("x","xs"), function () {
        var x = list.matchedn()['x']
          , xs = list.matchedn()['xs'];
        return x * mul(xs);
      })
    ._(Empty(), function () {
        return 1;
      })
    .end;
}






var list = arrToList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
assert(sum(list) === 55);
assert(mul(list) === 3628800);
















