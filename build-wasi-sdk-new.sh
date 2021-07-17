#!/bin/bash
set -e

if [ ! -d wasi-sdk ]
then
    mkdir wasi-sdk
    node scripts/download_wasi_sdk.js
fi
cp -R wasi-sdk wasi-sdk-new
cd wasi-sdk-src/
make build/llvm.BUILT build/wasi-libc.BUILT
cp -R build/install/opt/wasi-sdk/* ../wasi-sdk-new
cp -R ../wasi-sdk-new/* build/install/opt/wasi-sdk
make build/compiler-rt.BUILT build/libcxx.BUILT build/libcxxabi.BUILT
cp -R build/install/opt/wasi-sdk/* ../wasi-sdk-new
