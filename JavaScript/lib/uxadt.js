/******************************************************************
** 
** uxadt.js
**
**   A library that supports a universal, cross-platform embedded
**   representation for algebraic data type (ADT) values, and a
**   programming abstraction for operations (such as pattern
**   matching) on algebraic data type values.
**
**   Web:     uxadt.org
**   Version: 0.0.16
**
*/

(function (uxadt, global) {

  "use strict";


  var _ = null;




  /******************************************************************
  ** Matching
  *******************************************************************
  ** Data structure for maintaining the state of a chained matching
  ** expression. It must support the same matching interface as the
  ** one supported by values.
  */



  // Constructor.
  var Matching = function (candidate, end) {
      this.candidate = candidate;
      this.end = end;
    };



  // Matching function.
  Matching.prototype.match = function (p, f) {
      return this.end ? this : this.candidate.match(p, f);
    };

  Matching.prototype._ = Matching.prototype.match;










  /******************************************************************
  ** UntypedValue
  *******************************************************************
  ** Every UxADT value (i.e., instance of a data structure) and every
  ** UxADT pattern is represented as an UntypedValue object.
  */



  // constructor for untyped values for pattern matching
  var UntypedValue = function (con, fields) {
      this.type = null;
      this.con = con;
      this.fields = fields;
      this.last = null;
    };

  uxadt.UntypedValue = UntypedValue;



  // defines an untyped value in env
  UntypedValue.define = function (env, cons) {
      if (arguments.length === 1)
        return UntypedValue.define(global, arguments[0]);

      // assert constructors are undefined
      for (var con in cons) {
        if (con in env) {
          var ename = "Predefined Constructor";
          var emsg = format("Constructor '%' was already defined", con);
          throw new uxadt.Error(ename, emsg);
        }
      }

      // define constructors
      for (var con in cons) {
        env[con] = (function (con) {
            return function (/* arguments */) {
                var fields = Array.prototype.slice.call(arguments, 0);
                return new UntypedValue(con, fields);
              };
          })(con);
      }
    };

  uxadt.def = UntypedValue.define.bind(UntypedValue);



  UntypedValue.equal = function (a, b) {
      if (a === b) {
        // true equality
        return true;
      } else if (a === "#") {
        // number card
        return typeof b === "number";
      } else if (b === "$") {
        // string card
        return typeof b === "string";
      } else if (/^[a-z]+$/.test(a) || /^[a-z]+$/.test(b) || a === null || b === null) {
        // variable and wild card
        return true;
      } else if (a instanceof UntypedValue && b instanceof UntypedValue 
                 && a.con === b.con && a.fields.length === b.fields.length) {
        // UxADT values
        for (var i = 0; i < a.fields.length; i++)
          if (!UntypedValue.equal(a.fields[i], b.fields[i]))
            return false;
        return true;
      }
      return false;
    };



  // Pattern matching unification algorithm
  UntypedValue.unify = function (p, v) {

      function extend(a, b) {
        // shallow copy
        var a0 = {};
        for (var k in a)
          a0[k] = a[k];
        a = a0;
        // extend
        for (var k in b) {
          if (k in a && !UntypedValue.equal(a[k], b[k])) {
            // variable redefined
            var ename = "Unification Error";
            var emsg = format("Substitution % = % ≠ %", k, a[k], b[k]);
            throw new uxadt.Error(ename, emsg);
          } else {
            a[k] = b[k];
          }
        }
        return a;
      }

      var substs = {ordered: [], named: {}};

      // wild card
      if (p === null) {
        substs.ordered.push(v);
        return substs;
      }
      if (v === null) {
        return substs;
      }

      // number card
      if (p === "#") {
        if (typeof v === "number") {
          substs.ordered.push(v);
          return substs;
        } else {
          return null;
        }
      }

      // string card
      if (p === "$") {
        if (typeof v === "string") {
          substs.ordered.push(v);
          return substs;
        } else {
          return null;
        }
      }

      // variable string
      if (/^[a-z]+$/.test(p)) {
        substs.ordered.push(v);
        if (p !== v) {
          substs.named[p] = v;
        }
        return substs;
      }

      // Compare the constructors and recursively unify List fields if they match
      if (p instanceof TypedValue && v instanceof TypedValue) {
        if (p.con === v.con) {
          return UntypedValue.unify(p.fields, v.fields);
        } else {
          return null;
        }
      }

      // Compare the constructors and recursively unify Array fields if they match
      if (p instanceof UntypedValue && v instanceof UntypedValue) {
        if (p.con === v.con && p.fields.length === v.fields.length) {
          for (var i = 0; i < p.fields.length; i++) {
            var subst = UntypedValue.unify(p.fields[i], v.fields[i]);
            if (subst === null)
              return null;
            substs.ordered = substs.ordered.concat(subst.ordered);
            substs.named = extend(substs.named, subst.named);
          }
          return substs;
        } else {
          return null;
        }
      }

      // try equality
      if (p === v) {
        return substs;
      } else {
        return null;
      }
    };



  // returns a deep copy of this
  UntypedValue.prototype.clone = function () {
      var fields = [];
      for (var i = 0; i < this.fields.length; i++) {
        e = typeof this.fields[i] === "object" 
              ? this.fields[i].clone()
              : this.fields[i];
        fields.push(e);
      }
      return new Value(this.con, fields)
    };



  // comparing two untyped values
  UntypedValue.prototype.equal = function (v) {
      return UntypedValue.equal(this, v);
    };



  // Matching function
  UntypedValue.prototype._ = UntypedValue.prototype.match = function (p, f) {
      this.last = null; // clean up stateful match storage

      var subst = UntypedValue.unify(p, this);
      this.last = subst;

      if (!f) {
        return !!subst;
      } else {
        if (subst) {
          var end = f.apply(null, subst.ordered);
          this.last = null;
          return new Matching(this, end);
        } else {
          return new Matching(this, null);
        }
      }
    };
  


  // Last match named substitution retrieval when using stateful matching
  UntypedValue.prototype.matchedn = function () {
      if (this.last !== null)
        return this.last.named;
    };



  // Last match ordered substitution retrieval when using stateful matching
  UntypedValue.prototype.matchedo = function () {
      if (this.last !== null)
        return this.last.ordered;
    };



  // Rendering as a string
  UntypedValue.prototype.toString = function () {
      return format("%(%)", this.con, this.fields.map(String).join(", "));
    };












  /******************************************************************
  ** TypedValue
  *******************************************************************
  ** TypedValues extend UntypedValues, which promise type safety.
  */

  var TypedValue = function (type, con, fields) {
      UntypedValue.call(this, con, fields); // run the super constructor
      this.type = type;
    };

  uxadt.TypedValue = TypedValue;



  // inherit methods from UntypedValue
  TypedValue.prototype = Object.create(UntypedValue.prototype);
  TypedValue.constructor = TypedValue;



  // defines
  TypedValue.define = function (env, typeStr, cons) {
      if (arguments.length === 2)
        return TypedValue.define(global, arguments[0], arguments[1]);

      // set of types in current context
      var tys = env["__tys__"] = env["__tys__"] || {};

      // Parse `typeStr` into Type constructor
      var type = parseType(typeStr);

      // Assert the type is undefined
      type._(uxadt.Type(_,_), function (name, args) {
          if (name in tys) {
            var etype = "Predefined Type";
            var emsg = format("Type '%' has already been defined", name); 
            throw new uxadt.TypeError(etype, emsg);
          }
        });

      // Assert all constructors are undefined
      for (var con in cons) {
        if (con in env) {
          var etype = "Predefined Constructor";
          var emsg = format("Constructor '%' has already been defined", con);
          throw new uxadt.Error(etype, emsg);
        }
      }

      // Define the constructors
      type.cons = {};
      for (var con in cons) {
        type.cons[con] = arrToList(cons[con].map(parseType));
        env[con] = (function (con) {
            return function (/* arguments */) {
                var defFields = type.cons[con];
                var thisFields = listMap(argsToList(arguments), function (e) {
                    if (e === null) {
                      return null;
                    } else if (/^[a-z]+$/.test(e)) {
                      return null;
                    } else if (e === "#" || typeof e === "number") {
                      return uxadt.Num();
                    } else if (e === "$" || typeof e === "string") {
                      return uxadt.Str();
                    } else if (e instanceof uxadt.TypedValue) {
                      return e.type;
                    } else {
                      var args = Array.prototype.slice.call(arguments, 0).join(", ");
                      var emsg = format("% in %(%)", e, con, args);
                      throw new uxadt.TypeError("Unknown Type", emsg);
                    }
                  });
                try {
                  var substs = UntypedValue.unify(defFields, thisFields);
                } catch (e) {
                  throw new uxadt.TypeError(e.rawName, e.rawMessage);
                }    
                if (substs) {
                  var thisType = type._(uxadt.Type(_,_), function (name, args) {
                      args = listMap(args, function (a) { return substs.named[a] || a; });
                      return uxadt.Type(name, args);
                    }).end;
                  var fields = argsToList(arguments);
                  return new TypedValue(thisType, con, fields);
                } else {
                  var ename = "Unification";
                  var emsg = format("% U %", defFields, thisFields);
                  throw new uxadt.TypeError(ename, emsg);
                }
              };
          })(con);
      }

    };

  uxadt.tdef = TypedValue.define.bind(TypedValue);




  // Matching function
  TypedValue.prototype.match = function (p, f) {
      // assert `this` and `p` share a type
      if (!this.type.equal(p.type)) {
        var ename = "Type Inequality";
        var emsg = format("% ≠ %", this.type, p.type);
        throw new uxadt.TypeError(ename, emsg);
      }

      // call super method
      return UntypedValue.prototype.match.call(this, p, f);
    };

  TypedValue.prototype._ = TypedValue.prototype.match;



  TypedValue.prototype.toString = function () {
      return format("%::%%", typeToString(this.type), this.con, listToString(this.fields));
    };








  /******************************************************************
  ** Utility data types, functions, and errors
  *******************************************************************
  ** 
  ** 
  */


  // base error type for UxADT errors
  uxadt.Error = function (type, name, message) {
    Error.apply(this);
    this.name = format("(UxADT|%) %", type, name);
    this.rawName = name;
    this.rawMessage = message;
    this.message = message;
  }
  uxadt.Error.prototype = Object.create(Error.prototype);
  uxadt.Error.prototype.constructor = uxadt.Error;



  // extends a `uxadt.Error`
  uxadt.TypeError = function (name, message) {
    uxadt.Error.call(this, "TypeError", name, message);
  }
  uxadt.TypeError.prototype = Object.create(uxadt.Error.prototype);
  uxadt.TypeError.prototype.constructor = uxadt.TypeError;



  // converts a JS arguments object to a UxADT untyped List
  function argsToList(args) {
    var arr = Array.prototype.slice.call(args, 0);
    return arrToList(arr);
  }



  // converts a JS array to a UxADT untyped List
  function arrToList(arr, i) {
    i = i || 0;
    return i < arr.length
            ? uxadt.List(arr[i], arrToList(arr, i+1))
            : uxadt.Empty();
  }



  // sprintf-like function with universal specifier "%"
  function format(str /*, ... */) {
    for (var i = 1; i < arguments.length; i++)
      str = str.replace("%", String(arguments[i]));
    return str;
  }



  // maps a UxADT untyped List `list` by function `f`
  function listMap(list, f) {
    return list
      ._(uxadt.List(_,_), function (x,xs) {
          return uxadt.List(f(x), listMap(xs, f));
        })
      ._(uxadt.Empty(), function () {
          return uxadt.Empty();
        })
      .end;
  }


  // recursively converts a UxADT untyped List `list` to a string
  function listToString(list) {
    return "(" + list
      ._(uxadt.List(_,uxadt.Empty()), function (x) {
          return format("%)", x);
        })
      ._(uxadt.List(_,_), function (x,xs) {
          return format("%, %", x, listToString(xs));
        })
      ._(uxadt.Empty(), function () {
          return ")";
        })
      .end;
  }


  // parses a string `typeString` into a UxADT Type constructor
  function parseType(typeString) {
    function throwError() {
      var ename = "Parsing";
      var emsg = format("Invalid Type string `%`", typeString)
      throw new uxadt.TypeError(ename, emsg);      
    }
    function parse(ts) {
      // Number
      if (ts[0] === "#") {
        return [uxadt.Num(), ts.slice(1)];
      // String 
      } else if (ts[0] === "$") {
        return [uxadt.Str(), ts.slice(1)];
      // Type variable 
      } else if (/^[a-z][A-z]*$/.test(ts[0])) {
        return [ts[0], ts.slice(1)];
      // User-defined type 
      } else if (/^[A-Z][A-z]*$/.test(ts[0])) {
        var typeName = ts[0];
        var typeArgs = [];
        ts = ts.slice(1);
        if (ts.length && ts[0] === "(") {
          // User-defined parametric type
          while (true) {
            ts = ts.slice(1); // throw out '(' and ','
            var res = parse(ts);
            typeArgs.push(res[0]);
            ts = res[1];
            if (ts[0] === ',') {
              continue;
            } else if (ts[0] === ')') {
              ts = ts.slice(1);
              break;
            } else {
              throwError();
            }
          }
        }
        return [uxadt.Type(typeName, arrToList(typeArgs)), ts];
      }
      throwError();
    }
    var ts, res, type;
    ts = typeString
           .split(/([A-z]+|[\(\) #\$])/)
           .filter(function (t) { return !!t.trim(); });
    res = parse(ts);
    type = res[0];
    ts = res[1];
    if (ts.length) {
      throwError();
    } else {
      return type;
    }
  }


  // converts a Type to a string
  function typeToString(type) {
    return type
      ._(uxadt.Type(_,_), function (name, args) {
          return args._(uxadt.Empty()) ? name : name + listToString(args);
        })
      .end
  }



  // maps the UntypedValue constructors into the `uxadt` object
  UntypedValue.define(uxadt, {
    // List
    "List": [_,_],
    "Empty": [],

    // Type
    "Type": [_,_],
    "Str": [],
    "Num": [],
    "Void": []
  });





})(typeof exports !== "undefined" ? exports : (this.uxadt = {}), typeof global !== "undefined" ? global : window);
/* eof */