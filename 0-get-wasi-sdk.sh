#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
set -e

node $SCRIPT_DIR/scripts/download_wasi_sdk.js

rm -Rf $SCRIPT_DIR/wasi-sdk-new

cp -R $SCRIPT_DIR/wasi-sdk $SCRIPT_DIR/wasi-sdk-new
