from distutils.core import setup

setup(
    name             = 'UxADT',
    version          = '0.0.16.0',
    packages         = ['uxadt',],
    license          = 'MIT License',
	url              = 'http://uxadt.org',
	author           = 'A. Lapets',
	author_email     = 'lapets@bu.edu',
    description = 'Universal (cross-language) extensible representation for algebraic data type instances.',
    long_description = open('README.txt').read(),
)
