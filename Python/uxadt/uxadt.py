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
##   Version: 0.0.3.0
##
##

#####################################################################
## Data structure for maintaining the state of a chained matching
## expression. It must support the same matching interface as the one
## supported by values.
##

class _Matching():
    candidate = None
    end = None

    # Constructor.
    def __init__(self, candidate, end = None):
        if end is None:
            self.candidate = candidate
        else:
            self.end = end

    # Matching function.
    def match(self, p, f):
        return _Matching(None, self.end) if self.candidate is None else self.candidate.match(p, f)

    # Matching function (concise synonym).
    def _(self, p, f):
        return self.match(p, f)

#####################################################################
## Every UxADT value (i.e., instance of a data structure) and every
## UxADT pattern is represented as a Value object.
##

class Value():
    __at__ = {}

    def __init__(self, entries):
        self.__dict__.update(entries)

    # Structural equality.
    def __eq__(v, w): return v.equal(w)
    def equal(self, other):
        # If we are using stateful match storage, clean up
        # in case there is anything left over.
        if hasattr(self, '__last__'): delattr(self, '__last__')
        if hasattr(other, '__last__'): delattr(other, '__last__')
        
        # Compare the constructors and recursively check equality.
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

    # Pattern matching unification algorithm.
    @staticmethod
    def unify(p, v):
        if type(p) == str:
            return [(p, v)]

        if not isinstance(p, Value):
            return [(None, v)]

        # Compare the constructors and recursively unify if they match.
        for c in p.__dict__:
            for d in v.__dict__:
                if c == d and len(p.__dict__[c]) == len(v.__dict__[d]):
                    substs = []
                    for i in range(0,len(p.__dict__[c])):
                        subst = Value.unify(p.__dict__[c][i], v.__dict__[d][i])
                        if subst is None:
                            return None
                        substs.extend(subst)
                    return substs
                else:
                    return None
        return None

    # Matching function.
    def match(self, p, f):
        if hasattr(self, '__last__'): delattr(self, '__last__')
        if hasattr(p, '__last__'): delattr(p, '__last__')
        subst = Value.unify(p, self)
        return _Matching(self, None if subst is None else f(*[v for (x,v) in subst]))

    # Matching function (concise synonym).
    def _(self, p, f):
        return self.match(p, f)

    # Convenient, stateful alternative for Python
    # "if" statement blocks.
    def __lt__(v, p):
        subst = Value.unify(p, v)
        if subst != None:
            v.__last__ = [v for (x,v) in subst]
        return subst != None

    def __iter__(self):
        if hasattr(self, '__last__'):
            tmp = self.__last__
            delattr(self, '__last__')
            return iter(tmp)
        raise NameError('UxADT error: can only traverse result of match exactly once.')

    # Setting and getting labelled projections.
    def at(self, *args):
        if len(args) == 1:
            label = args[0]
            return self.__at__[label] if label in self.__at__ else None
        if len(args) == 2:
            label = args[0]
            proj = args[1]
            self.__at__[label] = proj
            return self
        return self

    # Rendering as a native nested data structure.
    def data(self):
        for c in self.__dict__:
            return {c: [v.data() for v in self.__dict__[c]]}

    # Rendering as a string.
    def __str__(self): return self.string()
    def string(self):
        for c in self.__dict__:
            return c + '(' + ', '.join([v.string() for v in self.__dict__[c]]) + ')'
        
#####################################################################
## Functions for defining algebraic data type constructors. There are
## two ways techniques supported for introducing constructors:
##  * defining them in the local scope as stand-alone functions
##    by passing the definition string to eval();
##  * defining a named object that has the named constructors as its
##    only methods.

def foreval(sigs):
    # Since emitted code will refer to uxadt operations
    # by name, the module must be defined in the scope.
    # Find the module name and return the code to evaluate.
    import inspect
    from types import ModuleType
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
                      'Please ensure that the module is being imported correctly.')

def asobject(sigs):
    class Obj(object):
        def __init__(self, cons):
            self.__dict__.update(cons)
    return Obj({con: eval("lambda *args: Value({'"+con+"': args})") for con in sigs})

# A synonym for the default technique.
def definition(sigs):
    return foreval(sigs)

#####################################################################
## Useful global synonyms.

try:    _
except: _ = None

##eof