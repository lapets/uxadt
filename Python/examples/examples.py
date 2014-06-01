#####################################################################
## 
## examples.py
##
##   Small examples that illustrate how the uxadt.py module can be
##   used.
##
##

import uxadt
_ = uxadt._

#####################################################################
## Defining constructors in the local scope as stand-alone functions.
##

eval(uxadt.foreval({\
    'Node': [_, _],\
    'Leaf': []\
    }))

t0 = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()))
t1 = Leaf()
t2 = Node(Node(Leaf(), Leaf()), Leaf())

def count(t):
    return t\
        ._(Leaf(),     lambda:     1)\
        ._(Node(_, _), lambda x,y: 1 + count(x) + count(y))\
        .end

print(count(t0))

#####################################################################
## Defining a named object that has the constructors as its methods.
##

Tree = uxadt.asobject({\
    'Node': [_, _],\
    'Leaf': []\
    })

t0 = Tree.Node(Tree.Node(Tree.Leaf(), Tree.Leaf()), Tree.Leaf())

def count(t):
    return t\
        ._(Tree.Leaf(),     lambda:     1)\
        ._(Tree.Node(_, _), lambda x,y: 1 + count(x) + count(y))\
        .end

print(str(t0) + " has count " + str(count(t0)) + ".")
t0.at('count', count(t0))
print(str(t0.at('count')))


##eof
