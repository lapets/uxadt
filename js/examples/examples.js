/********************************************************************
** 
** examples.js
**
**   Small examples that illustrate how the uxadt.js module can be
**   used.
**
*/

(function (examples) {

  "use strict";

  var uxadt = require("uxadt");
  var _ = null;

  /******************************************************************
  ** Defining constructors in the local scope as stand-alone functions.
  */

  uxadt._({
      'Red': [],
      'Blue': []
    });

  /* The algebraic data type name is optional; the first argument
     can be the type name, or it can be the object defining the
     constructors:
   
       uxadt._('Tree', {
           'Node': ['Tree', 'Tree'],
           'Leaf': []
         });

       uxadt._({
           'Node': [_, _],
           'Leaf': []
         });
   */

  uxadt._('Tree', {
      'Node': ['Tree', 'Tree'],
      'Leaf': []
    });

  var c0 = Red();
  var t0 = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()));
  var t1 = Leaf();
  var t2 = Node(Node(Leaf(), Leaf()), Leaf());

  function size(t) {
    return t
      ._(Leaf(),     function()     { return 1;  })
      ._(Node(_, _), function(x, y) { return 1 + size(x) + size(y); })
      .end;
  }

  console.log("Example #1");
  console.log(t0.toString());
  console.log(JSON.stringify(t0.toData()));
  t0 = t0.at('size', size(t0));
  console.log(t0.at('size'));
  console.log("");

  /******************************************************************
  ** Using alternate interface for pattern matching.
  */

  function width(t) {
    if (t._(Leaf())) {
      return 1;
    } else if (t._(Node(_, _))) {
      // For compatibility with Node.js.
      var m = t.matched();
      var x = m[0], y = m[1];

      return width(x) + width(y);
    }
  }

  console.log("Example #2");
  console.log(t0.toString() + " has width " + width(t0) + ".");
  console.log("");

  /******************************************************************
  ** Defining name-qualified constructors.
  */

  var Color = uxadt.qualified('Color', {
      'Red': [],
      'Blue': []
    });

  uxadt.qualified('Tree', {
      'Node': [_, _],
      'Leaf': []
    });

  var c0 = Color.Red();
  var t0 = Tree.Node(Tree.Node(Tree.Leaf(), Tree.Leaf()), Tree.Node(Tree.Leaf(), Tree.Leaf()));

  function height(t) {
    if (t._(Tree.Leaf())) {
      return 0;
    } else if (t._(Tree.Node(_, _))) {
      // For compatibility with Node.js.
      var m = t.matched();
      var x = m[0], y = m[1];

      return 1 + Math.max(height(x), height(y));
    }
  }

  console.log("Example #3");
  console.log(c0.toString());
  console.log(t0.toString() + " has height " + height(t0) + ".");
  console.log("");

  /******************************************************************
  ** Constructors wrapping values of other non-UxADT types.
  */

  uxadt._({
      'Just': [_],
      'Nothing': []
    });

  function unwrap(m) {
    return m._(Just(_), function(x) { return x; }).end;
  }

  console.log("Example #4");
  console.log(unwrap(Just(123)));
  console.log(unwrap(Just('ABC')));
  console.log(unwrap(Just(Just(['a', 'b', 'c']))));
  console.log(Just(123).toData());
  console.log(Just('ABC').toData());
  console.log(Just(Just(['a', 'b', 'c'])).toData());
  console.log("");

})(typeof exports !== 'undefined' ? exports : (this.examples = {}));
/* eof */