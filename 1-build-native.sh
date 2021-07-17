#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e

mkdir -p $SCRIPT_DIR/build/native
cd $SCRIPT_DIR/build/native

cmake -G Ninja \
		-DCMAKE_BUILD_TYPE=MinSizeRel \
		-DCMAKE_INSTALL_PREFIX=$SCRIPT_DIR/install \
		-DLLVM_TARGETS_TO_BUILD=WebAssembly \
		-DLLVM_DEFAULT_TARGET_TRIPLE=wasm32-wasi \
		-DLLVM_ENABLE_PROJECTS="lld;clang" \
		-DDEFAULT_SYSROOT=$SCRIPT_DIR/install/share/wasi-sysroot \
		$SCRIPT_DIR/wasi-sdk-src/src/llvm-project/llvm

ninja llvm-tblgen clang-tblgen llvm-config
