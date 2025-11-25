#!/bin/bash
set -e

# Check if op-sim is installed
if ! command -v op-sim &> /dev/null; then
    echo "Error: op-sim is not installed"
    echo "Please install it by running:"
    echo "  cd ../../op-sim"
    echo "  cargo install --path ."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set paths

# Input paths
POLICY_DATA_DIR="${SCRIPT_DIR}/policy-data-implementation"
POLICY_DATA_ORACLE_CODE="${POLICY_DATA_DIR}/openapi.js"
POLICY_DATA_WIT="${POLICY_DATA_DIR}/newton-provider.wit"

# Output paths
POLICY_FILES_DIR="${SCRIPT_DIR}/policy-files"
POLICY_WASM="${POLICY_FILES_DIR}/policy.wasm"

echo "Building policy.wasm..."
componentize-js --wit "${POLICY_DATA_WIT}" -o "$POLICY_WASM" "$POLICY_DATA_ORACLE_CODE" -d stdio random clocks http fetch-event

echo "Running simulation with input from wasm_args.json..."
INPUT=$(cat "$POLICY_FILES_DIR/wasm_args.json")

echo "Result: ...."
RESULT=$(op-sim "$POLICY_WASM" "$INPUT")
echo "$RESULT" | jq .
