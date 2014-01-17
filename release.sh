## Release script for HackageDB.

echo Building Haskell package for HackageDB.
cd Haskell
release.sh
cd ..
echo Done.
echo

echo Building and uploading Python package to PyPI.
cd Python
release.sh
cd ..
echo Done.
echo

echo Building and uploading JavaScript package to npmjs.org.
cd JavaScript
release.sh
cd ..
echo Done.
echo

echo Building PHP package.
echo Done.
echo

echo Release script for uxadt finished.
echo

##eof
