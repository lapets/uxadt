## Release script for HackageDB.

rm -rf dist
runhaskell Setup.lhs configure --user
runhaskell Setup.lhs build
runhaskell Setup.lhs install
runhaskell Setup.lhs haddock
runhaskell Setup.lhs sdist
tar -zxvf dist/*.tar.gz
tar --format=ustar -czf  `basename dist/*.tar.gz` uxadt-*/
## rm -rf uxadt-*

##eof