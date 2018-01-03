# uxadt

Cross-platform embedded representation for algebraic data types, values, and common operations.

[![npm version and link.](https://badge.fury.io/js/uxadt.svg)](https://badge.fury.io/js/uxadt)

This family of libraries supports a cross-platform embedded representation for algebraic data type (ADT) values, and platform-specific embedded programming abstractions for common operations (such as pattern matching) on algebraic data type values.

## Package Installation and Usage

It is possible to use the library within a [Node.js](http://www.nodejs.org) module in the following way:
```javascript
var uxadt = require("./uxadt.js");
```
It is possible to use the library within an HTML page in the following way:
```html
<script src="uxadt.js"></script>
```
You may want to define `_` for the sake of concision:
```javascript
var _ = null;
```
It does not matter what is assigned to `_`, as long as it is *not a uxadt value*.

## Examples

The following is a simple algebraic data type definition:
```javascript
uxadt._({
    Node: [_, _],
    Leaf: []
  });
```
To better document the implicit constraints associated with the definition, it is possible to provide an explicit name for the algebraic data type and the types of the constructor arguments (no static or dynamic checking of the constraints implied by this information is currently supported by the library itself):
```javascript
uxadt._('Tree', {
    Node: ['Tree', 'Tree'],
    Leaf: []
  });
```
An individual value can then be built up as an expression in the following way:
```javascript
Node(Node(Leaf(), Leaf()), Leaf())
```
Below is a simple recursive function that counts the number of nodes in a tree value (i.e., a value that corresponds to the algebraic data type definition in the above example):
```javascript
function size(t) {
  return t
    ._(Leaf(),     function()    { return 1; })
    ._(Node(_, _), function(x, y){ return 1 + size(x) + size(y); })
    .end;
}
```
The library provides an alternate interface for using pattern matching that follows a more imperative paradigm:
```javascript
function size(t) {
  if (t._(Leaf())) {
    return 1;
  } else if (t._(Node(_, _))) {
    [x, y] = t.matched();
    return 1 + size(x) + size(y);
  }
}
```
