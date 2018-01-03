=====
uxadt
=====

Cross-platform embedded representation for algebraic data types, values, and common operations.

.. image:: https://badge.fury.io/py/uxadt.svg
   :target: https://badge.fury.io/py/uxadt
   :alt: PyPI version and link.

This family of libraries supports a cross-platform embedded representation for algebraic data type (ADT) values, and platform-specific embedded programming abstractions for common operations (such as pattern matching) on algebraic data type values.

Package Installation and Usage
------------------------------
The package is available on PyPI::

    python -m pip install uxadt

The library can be imported in the usual way::

    import uxadt

You may want to define :code:`_` as a global for the sake of concision::

    _ = None

It does not matter what is assigned to :code:`_`, as long as it is *not a uxadt value*.
    
Examples
--------

The following is a simple algebraic data type definition::

    uxadt._({\
        'Node': [_, _],\
        'Leaf': []\
      })

To better document the implicit constraints associated with the definition, it is possible to provide an explicit name for the algebraic data type and the types of the constructor arguments (no static or dynamic checking of the constraints implied by this information is currently supported by the library itself)::

    uxadt._('Tree', {\
        'Node': ['Tree', 'Tree'],\
        'Leaf': []\
      })

An individual value can be built up as an expression in the following way::

    Node(Node(Leaf(), Leaf()), Leaf())

Below is a simple recursive function that counts the number of nodes in a tree value (i.e., a value that corresponds to the algebraic data type definition in the above example)::

    def size(t):
      return t\
        ._(Leaf(),     lambda:     1)\
        ._(Node(_, _), lambda x,y: 1 + size(x) + size(y))\
        .end

The library provides an alternate interface for using pattern matching that follows a more imperative paradigm (this can be useful because the body of a :code:`lambda` expression cannot be a statement):

    def size(t):
      if t < Leaf():
        return 1
      elif t < Node(_, _):
        (x, y) = t
        return 1 + size(x) + size(y)
