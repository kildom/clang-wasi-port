#!/bin/bash
set -e

LLVM_BASE_COMMIT=176249bd6732a8044d457092ed932768724a6f06

if [ ! -d wasi-sdk ]
then
    mkdir wasi-sdk
    node scripts/download_wasi_sdk.js
fi
rm -Rf wasi-sdk-new
cp -R wasi-sdk wasi-sdk-new
cd wasi-sdk-src/
if [ ! -d build/llvm/bin ]
then
    cd src/llvm-project
    LLVM_OLD_COMMIT=`git rev-parse HEAD`
    git checkout $LLVM_BASE_COMMIT
    cd ../..
    make build/llvm.BUILT
    cd src/llvm-project
    git checkout $LLVM_OLD_COMMIT
    cd ../..
fi
make build/wasi-libc.BUILT
cp -R build/install/opt/wasi-sdk/* ../wasi-sdk-new
cp -R ../pthread_stub/include/* ../wasi-sdk-new/share/wasi-sysroot/include
cp -R ../wasi-sdk-new/* build/install/opt/wasi-sdk
make build/compiler-rt.BUILT build/libcxx.BUILT build/libcxxabi.BUILT
cp -R build/install/opt/wasi-sdk/* ../wasi-sdk-new
