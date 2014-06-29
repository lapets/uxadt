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
##   Version: 0.0.10.0
##
##

#####################################################################
## Data structure for maintaining the state of a chained matching
## expression. It must support the same matching interface as the one
## supported by values.
##

class Matching():
    candidate = None
    end = None

    # Constructor.
    def __init__(self, candidate, end = None):
        if end is None:
            self.candidate = candidate
        else:
            self.end = end

    # Matching function.
    def _(self, p, f): return self.match(p, f)
    def match(self, p, f):
        return Matching(None, self.end) if self.candidate is None else self.candidate.match(p, f)

#####################################################################
## Every UxADT value (i.e., instance of a data structure) and every
## UxADT pattern is represented as a Value object.
##

class Value():
    __ty__ = None
    __at__ = {}
    __last__ = None

    # Constructor.
    def __init__(self, entries, ty = None):
        self.__dict__.update(entries)
        self.__ty__ = ty

    # Structural equality.
    def __eq__(v, w): return v.equal(w)
    def equal(self, other):
        # If we are using stateful match storage, clean up
        # in case there is anything left over.
        self.__last__ = None

        # Compare the constructors and recursively check equality.
        for c in self.__dict__:
            for d in other.__dict__:
                if c[0:min(len(c),2)] != '__' and d[0:min(len(d),2)] != '__':
                    if c == d and len(self.__dict__[c]) == len(other.__dict__[d]):
                        for i in range(0,len(self.__dict__[c])):
                            if not self.__dict__[c][i].equal(other.__dict__[d][i]):
                                return False
                        return True
                    else:
                        return False
        return False # Failure

    # Pattern matching unification algorithm.
    @staticmethod
    def unify(p, v):
        if not isinstance(p, Value):
            return [v]

        # Compare the constructors and recursively unify if they match.
        for c in p.__dict__:
            for d in v.__dict__:
                if c[0:min(len(c),2)] != '__' and d[0:min(len(d),2)] != '__':
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
    def __lt__(self, p): return self.match(p, None)
    def _(self, p, f): return self.match(p, f)
    def match(self, p, f = None):
        # If we are using stateful match storage, clean up
        # in case there is anything left over.
        self.__last__ = None

        subst = Value.unify(p, self)
        if f == None:
            if subst != None and len(subst) > 0:
                self.__last__ = subst
            return subst != None
        else:
            return Matching(self, None if subst is None else f(*subst))

    ## Last match retrieval when using stateful matching.
    def __iter__(self): return self.matched()
    def matched(self):
        if self.__last__ != None:
            tmp = self.__last__
            self.__last__ = None
            return iter(tmp)
        raise NameError('UxADT error: can only traverse result of match exactly once after a match has occurred.')

    # Setting and getting labeled projections.
    def at(self, *args):
        if len(args) == 1:
            label = args[0]
            return self.__at__[label] if label in self.__at__ else None
        elif len(args) == 2:
            [label, proj] = args
            self.__at__[label] = proj
            return self
        return self

    # Rendering as a native nested data structure.
    def toData(self):
        for c in self.__dict__:
            if c[0:2] != '__':
                return {c: [\
                    v.toData() if type(v) == Value else v\
                    for v in self.__dict__[c]\
                    ]}

    # Rendering as a string.
    def __repr__(self): return self.toString()
    def __str__(self): return self.toString()
    def toString(self):
        for c in self.__dict__:
            if c[0:2] != '__':
                return (self.__ty__ + '.' if self.__ty__ != None else '') +\
                       c + '(' + ', '.join([str(v) for v in self.__dict__[c]]) + ')'

#####################################################################
## Functions for defining algebraic data type constructors. There
## are two ways techniques supported for introducing constructors:
##  * defining them in the local scope as stand-alone, unqualified
##    functions by passing the definition string to eval();
##  * defining a named class or object that has the named
##    constructors as its only methods.
##

def unqualified(arg1, arg2 = None):
    from types import ModuleType

    # If a name was supplied explicitly as the first argument,
    # ignore it and use the second argument for the signatures.
    sigs = arg1 if arg2 == None else arg2

    # Obtain the global context.
    import inspect
    frame = inspect.currentframe()
    context = inspect.currentframe().f_back.f_globals

    # Define the constructors as unqualified globals.
    for name in frame.f_back.f_locals:
        try:
            if type(frame.f_back.f_locals[name]) == ModuleType and frame.f_back.f_locals[name].Value == Value:
                stmts = []
                stmts += [con + " = lambda *args, **kwargs: "+name+".Value({'" + con + "': args})" for con in sigs]
                stmts = ['exec("' + s + '")' for s in stmts]
                for con in sigs:
                  context[con] = eval("lambda *args, **kwargs: Value({'" + con + "': args})")
                return '(' + ",".join(stmts) + ')'
        except: pass
    for name in frame.f_globals:
        try:
            if frame.f_globals[name] == Value:
                stmts = []
                stmts += [con + " = lambda *args, **kwargs: " + name + "({'" + con + "': args})" for con in sigs]
                stmts = ['exec("' + s + '")' for s in stmts]
                for con in sigs:
                  context[con] = eval("lambda *args, **kwargs: Value({'" + con + "': args})")
                return '(' + ",".join(stmts) + ')'
        except: pass

    # Since emitted code will refer to uxadt operations
    # by name, the module must be defined in the scope.
    # Find the module name and return the code to evaluate.
    raise NameError('UxADT error: module cannot be found in the scope. '+\
                    'Please ensure that the module is being imported correctly.')

def qualified(arg1, arg2 = None):
    # If a qualifier was supplied explicitly as the first argument,
    # use it; otherwise, make a qualifier using the names of the
    # constructors.
    if arg2 == None:
        sigs = arg1
        name = '_Type' + "_".join([con for con in sigs])
    else:
        sigs = arg2
        name = arg1

    # Create the class that has the constructors as named static methods.
    class _Type(object):
        def __init__(self, cons):
            self.__dict__.update(cons)
    cls = type(name, (_Type,), {con: eval("lambda *args: Value({'"+con+"': args}, '" + name + "')") for con in sigs}) 
    
    # Make the named class available in the global context and also return it.
    try:
        import inspect
        inspect.currentframe().f_back.f_globals[name] = cls
    except: pass
    return cls

# Synonyms for the default technique.
definition = unqualified
_ = unqualified

##eof