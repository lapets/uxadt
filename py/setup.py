from setuptools import setup

setup(
    name             = 'uxadt',
    version          = '0.1.0.0',
    packages         = ['uxadt',],
    install_requires = [],
    license          = 'MIT',
	url              = 'http://uxadt.org',
	author           = 'Andrei Lapets',
	author_email     = 'a@lapets.io',
    description      = 'Cross-platform embedded representation for algebraic data types, values, and common operations.',
    long_description = open('README.rst').read(),
    test_suite       = 'nose.collector',
    tests_require    = ['nose'],
)
