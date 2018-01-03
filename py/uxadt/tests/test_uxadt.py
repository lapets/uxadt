from unittest import TestCase
import uxadt

_ = None

uxadt._({\
    'Red': [],\
    'Blue': []\
  })

uxadt._('Tree', {\
    'Node': ['Tree', 'Tree'],\
    'Leaf': []\
  })

c0 = Red()
t0 = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()))
t1 = Leaf()
t2 = Node(Node(Leaf(), Leaf()), Leaf())

def size(t):
    return t\
        ._(Leaf(),     lambda:     1)\
        ._(Node(_, _), lambda x,y: 1 + size(x) + size(y))\
        .end

Color = uxadt.qualified('Color', {\
    'Red': [],\
    'Blue': []\
  })

uxadt.qualified('Tree', {\
    'Node': [_, _],\
    'Leaf': []\
  })

c0 = Color.Red()
t3 = Tree.Node(Tree.Node(Tree.Leaf(), Tree.Leaf()), Tree.Leaf())

def height(t):
    if t < Tree.Leaf():
        return 0
    elif t < Tree.Node(_, _):
        (x, y) = t
        return 1 + max(height(x), height(y))

uxadt._({\
    'Just': [_],\
    'Nothing': []\
  })

def unwrap(m):
    return m._(Just(_), lambda x: x).end
        
class TestPool(TestCase):
    def test_toString(self):
        self.assertEqual(str(c0), "Color.Red()")
        self.assertEqual(str(t3), "Tree.Node(Tree.Node(Tree.Leaf(), Tree.Leaf()), Tree.Leaf())")

    def test_toData(self):
        self.assertEqual(Just(123).toData(), {'Just': [123]})
        self.assertEqual(Just('ABC').toData(), {'Just': ['ABC']})
        self.assertEqual(Just(Just(['a', 'b', 'c'])).toData(), {'Just': [{'Just': [['a', 'b', 'c']]}]})
        self.assertEqual(t0.toData(), {'Node': [{'Node': [{'Leaf': []}, {'Leaf': []}]}, {'Node': [{'Leaf': []}, {'Leaf': []}]}]})
        
    def test_match(self):
        self.assertEqual(size(t0), 7)
        self.assertEqual(height(t3), 2)
        self.assertEqual(unwrap(Just(123)), 123)
        self.assertEqual(unwrap(Just('ABC')), 'ABC')
        self.assertEqual(unwrap(unwrap(Just(Just(['a', 'b', 'c'])))), ['a', 'b', 'c'])

    def test_at(self):
        t0.at('size', size(t0))
        self.assertEqual(t0.at('size'), 7)

## eof