#####################################################################
## 
## uxadt.py
##
##   A library that supports a universal, cross-platform embedded
##   representation for algebraic data type (ADT) values, and a
##   programming abstraction for operations (such as pattern
##   matching) on algebraic data type values.
##
##   Web:     uxadt.org
##   Version: 0.0.0.3
##
##

#####################################################################
## Representation for individual algebraic data type values and
## patterns.

class Value():
    def __init__(self, entries): 
        self.__dict__.update(entries)

    # Structural equality.
    def equal(self, other):
        for c in self.__dict__:
            for d in other.__dict__:
                if c == d and len(self.__dict__[c]) == len(other.__dict__[d]):
                    for i in range(0,len(self.__dict__[c])):
                        if not self.__dict__[c][i].equal(other.__dict__[d][i]):
                            return False
                    return True
                else:
                    return False
        return False

    # Matching function.
    def match(self, p, f):
        subst = uxadt.unify(p, self)
        return Matching(self, None if subst is None else f(*subst))

    # Matching function (concise synonym).
    def _(self, p, f):
        subst = uxadt.unify(p, self)
        return Matching(self, None if subst is None else f(*subst))

#####################################################################
## Representation for state of matching computations.

class Matching():
    candidate = None
    end = None

    def __init__(self, candidate, end):
        if end is None:
            self.candidate = candidate
        else:
            self.end = end

    # Matching function.
    def match(self, p, f):
        return Matching(None, self.end) if self.candidate is None else  self.candidate.match(p, f)

    # Matching function (concise synonym).
    def _(self, p, f):
        return Matching(None, self.end) if self.candidate is None else  self.candidate.match(p, f)

#####################################################################
## Container class for library.

class uxadt():

    _ = None

    @staticmethod
    def unify(p, v):
        if not isinstance(p, Value):
            return [v]

        for c in p.__dict__:
            for d in v.__dict__:
                if c == d and len(p.__dict__[c]) == len(v.__dict__[d]):
                    substs = []
                    for i in range(0,len(p.__dict__[c])):
                        subst = uxadt.unify(p.__dict__[c][i], v.__dict__[d][i])
                        if subst is None:
                            return None
                        substs.extend(subst)
                    return substs
                else:
                    return None
        return None

    @staticmethod
    def definition(sigs):
        # Since emitted code will refer to uxadt operations
	# by name, the object must be defined in the scope.
        if not 'uxadt' in globals():
            raise NameError('UxADT error: identifier uxadt must be defined.')

        stmts = []
        stmts += [con + " = lambda *args, **kwargs: Value({'" + con + "': args})" for con in sigs]
        stmts = ['exec("' + s + '")' for s in stmts]
        return '(' + ",".join(stmts) + ')'

#####################################################################
## Useful global synonyms.

try:
    _
except:
    _ = uxadt._

#####################################################################
## Examples.

'''
eval(uxadt.definition({\
    'Node': [_, _],\
    'Leaf': []\
    }))

x = Node(Node(Leaf(), Leaf()), Leaf())
y = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()))
z = Leaf()

def nodes(t):
    return t\
        .match(Leaf(), lambda: 1)\
        .match(Node(_, _), lambda x,y: 1 + nodes(x) + nodes(y))\
        .end

print(nodes(Leaf()))
print(nodes(Node(Leaf(), Node(Leaf(), Leaf()))))
print(nodes(y))
'''

##eof
