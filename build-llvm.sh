#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e

mkdir -p $SCRIPT_DIR/build/install
cd $SCRIPT_DIR/build

export CC="$SCRIPT_DIR/wasi-sdk-new/bin/clang --sysroot=$SCRIPT_DIR/wasi-sdk-new/share/wasi-sysroot"
export CXX="$SCRIPT_DIR/wasi-sdk-new/bin/clang++ --sysroot=$SCRIPT_DIR/wasi-sdk-new/share/wasi-sysroot"

echo 
cmake -G Ninja \
		-DCMAKE_BUILD_TYPE=MinSizeRel \
		-DCMAKE_INSTALL_PREFIX=$SCRIPT_DIR/build/install \
		-DLLVM_TARGETS_TO_BUILD=WebAssembly \
		-DLLVM_DEFAULT_TARGET_TRIPLE=wasm32-wasi \
		-DLLVM_ENABLE_PROJECTS="lld;clang" \
		-DDEFAULT_SYSROOT=$SCRIPT_DIR/build/install/share/wasi-sysroot \
		-DCMAKE_CROSSCOMPILING=True \
		-DLLVM_TABLEGEN=$SCRIPT_DIR/wasi-sdk-src/build/llvm/bin/llvm-tblgen \
		-DCLANG_TABLEGEN=$SCRIPT_DIR/wasi-sdk-src/build/llvm/bin/clang-tblgen \
		-DLLVM_TARGET_ARCH=wasm32 \
		-DBUILD_SHARED_LIBS=OFF \
		-DLLVM_BUILD_DOCS=OFF \
		-DLLVM_BUILD_INSTRUMENTED_COVERAGE=OFF \
		-DLLVM_BUILD_LLVM_DYLIB=OFF \
		-DLLVM_BUILD_TESTS=OFF \
		-DLLVM_ENABLE_DOXYGEN=OFF \
		-DLLVM_ENABLE_EH=OFF \
		-DLLVM_ENABLE_MODULES=OFF \
		-DLLVM_ENABLE_RTTI=OFF \
		-DLLVM_ENABLE_SPHINX=OFF \
		-DLLVM_ENABLE_THREADS=OFF \
		-DLLVM_ENABLE_UNWIND_TABLES=OFF \
		-DLLVM_ENABLE_ZLIB=OFF \
		-DLLVM_INCLUDE_EXAMPLES=OFF \
		-DLLVM_INCLUDE_TESTS=OFF \
		-DLLVM_BUILD_BENCHMARKS=OFF \
		-DLLVM_INCLUDE_BENCHMARKS=OFF \
		-DLLVM_LINK_LLVM_DYLIB=OFF \
		-DCMAKE_SKIP_BUILD_RPATH=ON \
		$SCRIPT_DIR/wasi-sdk-src/src/llvm-project/llvm

ninja -v install-clang install-lld
