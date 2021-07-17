#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e

rm -Rf $SCRIPT_DIR/build/libc
mkdir -p $SCRIPT_DIR/build/libc
rm -Rf $SCRIPT_DIR/wasi-sdk-src/build
mkdir -p $SCRIPT_DIR/wasi-sdk-src/build

cd $SCRIPT_DIR/wasi-sdk-src
make build/wasi-libc.BUILT

cp -R $SCRIPT_DIR/build/libc/* $SCRIPT_DIR/wasi-sdk-new/share/wasi-sysroot/
