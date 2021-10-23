# Clang compiled with WASI-SDK

[![CI](https://github.com/kildom/clang-wasi-port/actions/workflows/main.yml/badge.svg)](https://github.com/kildom/clang-wasi-port/actions/workflows/main.yml)

This is an experimental project. The goal is to compile Clang using WASI-SDK.

This cannot be achieved without source code modifications. The repository contains patched WASI-SDK and patched Clang (in the submodules). The modifications are done in areas which WASI-SDK does not support, but Clang requires them, mostly pthreads, signals, mmap, process spawning, and others.

The WASI interface does not cover all required features, so the resulting WebAssembly module imports additional module `nonwasi`. It covers child process spawning and other small tasks.

## Results

**The experiment was successful.** [CI](https://github.com/kildom/clang-wasi-port/actions/workflows/main.yml) is able to:
* compile patched WASI-SDK,
* compile Clang with patched WASI-SDK,
* run it in Node.js to compile *Hello World C++* program,
* test compilation result by running it in Node.js.

## What's next?

This was just an experiment. It is far from production-ready. The goal was achieved, so I am not sure if there will be more work done here.

To make it a decent project, a lot of work should be done, e.g.:
* code cleanup,
* file/directory structure cleanup,
* make patched source code more visible and easier for future merging,
* improve naming,
* implement some unimplemented things that may be needed in some cases,
* make some more documentation,
* make good quality Node.js and browser JS wrappers,
* **a lot of tests** in both Node.js, browser, and maybe some other engines.
