
var uxadt = require("../uxadt.js");

var _ = null;

function assert(bool, message) {
  if (!bool)
    throw new Error(message || "");
}




uxadt.tdef("Tree", {
  "Node": ["Tree", "Tree"],
  "Leaf": ["#"]
});


function sum(xs) {
  var s = 0;
  for (var i = 0; i < xs.length; i++)
    s += xs[i];
  return s;
}


function leaves(tree) {
  return tree
    ._(Node(_,_), function (l, r) {
        return leaves(l).concat(leaves(r));
      })
    ._(Leaf(_), function (v) {
        return [v];
      })
    .end;
}





var tree = Node(Node(Leaf(1), Leaf(2)), Node(Node(Leaf(3), Leaf(4)), Node(Leaf(5), Node(Node(Node(Leaf(6), Leaf(7)), Leaf(8)), Node(Leaf(9), Leaf(10))))));
assert(sum(leaves(tree)) === 55, "Matching algorithm logic error");



(function () {
  var flag = false;
  try {
    var badtree = Node(Node(Leaf(6), Leaf("_oops")), Leaf(8));
  } catch (e) {
    flag = true;
  }
  assert(flag, "No type error was thrown!");
})();




