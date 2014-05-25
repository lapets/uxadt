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
##   Version: 0.0.0.5
##
##

import inspect
from types import ModuleType

#####################################################################
## Representation for individual algebraic data type values and
## patterns.

class Value():
    def __init__(self, entries): 
        self.__dict__.update(entries)

    # Structural equality.
    def equal(self, other):
        if hasattr(self, '__last__'): delattr(self, '__last__')
        if hasattr(other, '__last__'): delattr(other, '__last__')
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

    def __eq__(v, w):
        return v.equal(w)

    # Matching function.
    def match(self, p, f):
        if hasattr(self, '__last__'): delattr(self, '__last__')
        if hasattr(p, '__last__'): delattr(p, '__last__')
        subst = uxadt.unify(p, self)
        return _Matching(self, None if subst is None else f(*[v for (x,v) in subst]))

    # Matching function (concise synonym).
    def _(self, p, f):
        return match(self, p, f)

    # Convenient, stateful alternative for Python
    # "if" statement blocks.
    def __lt__(v, p):
        subst = uxadt.unify(p, v)
        if subst != None:
            v.__last__ = [v for (x,v) in subst]
        return subst != None

    def __iter__(self):
        if hasattr(self, '__last__'):
            tmp = self.__last__
            delattr(self, '__last__')
            return iter(tmp)
        raise NameError('UxADT error: can only traverse result of match exactly once.')

#####################################################################
## Representation for state of matching computations.

class _Matching():
    candidate = None
    end = None

    def __init__(self, candidate, end):
        if end is None:
            self.candidate = candidate
        else:
            self.end = end

    # Matching function.
    def match(self, p, f):
        return _Matching(None, self.end) if self.candidate is None else  self.candidate.match(p, f)

    # Matching function (concise synonym).
    def _(self, p, f):
        return _Matching(None, self.end) if self.candidate is None else  self.candidate.match(p, f)

#####################################################################
## Container class for library.

class uxadt():
    _ = None

    # Pattern matching unification algorithm.
    @staticmethod
    def unify(p, v):
        if type(p) == str:
            return [(p, v)]

        if not isinstance(p, Value):
            return [(None, v)]

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
      # by name, the module must be defined in the scope.
      # Find the module name and return the code to evaluate.
      frame = inspect.currentframe()
      for name in frame.f_back.f_locals:
          try:
              if type(frame.f_back.f_locals[name]) == ModuleType and frame.f_back.f_locals[name].Value == Value:
                  stmts = []
                  stmts += [con + " = lambda *args, **kwargs: "+name+".Value({'" + con + "': args})" for con in sigs]
                  stmts = ['exec("' + s + '")' for s in stmts]
                  return '(' + ",".join(stmts) + ')'
          except: pass
      for name in frame.f_globals:
          try:
              if frame.f_globals[name] == Value:
                  stmts = []
                  stmts += [con + " = lambda *args, **kwargs: " + name + "({'" + con + "': args})" for con in sigs]
                  stmts = ['exec("' + s + '")' for s in stmts]
                  return '(' + ",".join(stmts) + ')'
          except: pass
      raise NameError('UxADT error: module cannot be found in global scope. '+\
                      'Please ensure that the module is being loaded correctly.')

    @staticmethod
    def define(sigs):
        definition(sigs)
           
                      
#####################################################################
## Useful global synonyms.

try:    _
except:
  _ = uxadt._

try:    definition
except: definition = uxadt.definition

try:    define
except: define = uxadt.definition

#####################################################################
## Examples.

'''
eval(define({\
    'Node': [_, _],\
    'Leaf': []\
    }))

x = Leaf()
y = Node(Node(Leaf(), Leaf()), Leaf())
z = Node(Node(Leaf(), Leaf()), Node(Leaf(), Leaf()))

def nodes(t):
    return t\
        .match(Leaf(), lambda: 0)\
        .match(Node(_, _), lambda x,y: 1 + nodes(x) + nodes(y))\
        .end

def leaves(t):
  return t\
    .match(Leaf(), lambda: 1)\
    .match(Node(_, _), lambda x,y: leaves(x) + leaves(y))\
    .end

def height(t):
  return t\
    .match(Leaf(), lambda: 1)\
    .match(Node(_, _), lambda x,y: 1 + max(height(x), height(y)))\
    .end

def perfect(t):
  return t\
    .match(Leaf(), lambda: True)\
    .match(Node(_, _), lambda x,y: (height(x) == height(y)) and (perfect(x) and perfect(y)))\
    .end
'''

##eof