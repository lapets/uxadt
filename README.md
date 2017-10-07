# uxadt

Universal (cross-language) extensible representation for algebraic data type instances. More information is available at [uxadt.org](http://uxadt.org).

[![npm version and link.](https://badge.fury.io/js/uxadt.svg)](https://badge.fury.io/js/uxadt)
[![PyPI version and link.](https://badge.fury.io/py/uxadt.svg)](https://badge.fury.io/py/uxadt)

This family of libraries supports a cross-platform embedded representation for algebraic data type (ADT) values, and platform-specific embedded programming abstractions for common operations (such as pattern matching) on algebraic data type values.

## Directory Structure

The directory structure and locations of noteworthy files are as follows:

* `/hs/`
  The Haskell version of the library, ready for packaging.

  - `/hs/release.sh`
  Release script for building package for manual submission to [HackageDB](http://hackage.haskell.org/).

  - `/hs/Text/UxADT.hs`
  The source of the Haskell version of the library.

* `/js/`
  The JavaScript version of the library, ready for packaging and publication.

  - `/js/lib/uxadt.js`
  The source of the JavaScript version of the library.

  - `/js/examples/`
  Examples illustrating how the library can be used with Node.js and HTML.

* `/php/`
  The PHP version of the library, ready for packaging and publication.

  - `/php/src/uxadt.php`
  The source of the PHP version of the library.

  - `/php/examples/`
  Examples illustrating how the library can be used in PHP.

* `/py/`
  The Python version of the library, ready for packaging and publication.

  - `/py/release.sh`
  Release script for building package and publishing it on [PyPI](https://pypi.python.org/).

  - `/py/uxadt/uxadt.py`
  The source of the Python version of the library.

  - `/py/examples/`
  Examples illustrating how the library can be used in Python.
