var assert = require('assert');
var expect = require('chai').expect;
var uxadt = require('../lib/uxadt');

describe('uxadt', function() {
  var _ = null;

  uxadt._('Tree', {
      'Node': ['Tree', 'Tree'],
      'Leaf': []
    });

  var t0 = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()));
  var t1 = Node(Node(Leaf(), Leaf()), Leaf());

  describe('#toString()', function () { 
    it('toString', function() {
      assert.equal(t0.toString(), 'Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()))');
    });
  });

  describe('#toData()', function () { 
    it('toString', function() {
      assert.equal(JSON.stringify(t0.toData()), '{"Node":[{"Node":[{"Leaf":[]},{"Leaf":[]}]},{"Node":[{"Leaf":[]},{"Leaf":[]}]}]}');
    });
  });
  
  function size(t) {
    return t
      ._(Leaf(),     () => 1 )
      ._(Node(_, _), (x, y) => 1 + size(x) + size(y) )
      .end;
  }

  describe('#_()', function () { 
    it('_', function() {
      assert.equal(size(t0), 7);
    });
  });
  
  describe('#at()', function () { 
    it('at', function() {
      t1.at('size', size(t1));
      assert.equal(t1.at('size'), 5);
    });
  });
});
