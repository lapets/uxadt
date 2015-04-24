#!/usr/bin/env bash

cd tests
for f in * ; do
	echo "Testing $f"
	node $f
done


