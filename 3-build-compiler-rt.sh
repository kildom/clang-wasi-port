#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e

rm -Rf $SCRIPT_DIR/wasi-sdk-src/build
mkdir -p $SCRIPT_DIR/wasi-sdk-src/build

cd $SCRIPT_DIR/wasi-sdk-src

make build/compiler-rt.BUILT
