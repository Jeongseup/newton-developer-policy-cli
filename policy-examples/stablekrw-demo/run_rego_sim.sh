#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR/../.."

# Configuration
POLICY_WASM="$SCRIPT_DIR/policy-files/policy.wasm"
WASM_ARGS_FILE="$SCRIPT_DIR/policy-files/wasm_args.json"
POLICY_REGO="$SCRIPT_DIR/policy-files/policy.rego"
PARAMS_JSON="$SCRIPT_DIR/policy_params_data.json"
INTENT_JSON="$SCRIPT_DIR/test_intent.json"
REGO_QUERY="stablekrw_demo.allow" # it means the package name from policy.rego

# Auto-prefix 'data.' if not present
if [[ "$REGO_QUERY" != data.* ]]; then
  REGO_QUERY="data.$REGO_QUERY"
fi

# Intermediary files
INTERMEDIARY_DIR="$SCRIPT_DIR/intermediary"
mkdir -p "$INTERMEDIARY_DIR"
WASM_DATA="$INTERMEDIARY_DIR/wasm_data.json"
DATA_JSON="$INTERMEDIARY_DIR/data.json"
INPUT_JSON="$INTERMEDIARY_DIR/input.json"
EVAL_RESULT="$INTERMEDIARY_DIR/eval_result.json"

echo "1. Running WASM simulation..."
# Read WASM args from file
WASM_ARGS=$(cat "$WASM_ARGS_FILE")

# Run op-sim
if command -v op-sim &> /dev/null; then
    op-sim "$POLICY_WASM" "$WASM_ARGS" > "$WASM_DATA"
else
    echo "op-sim not found in PATH, Please install op-sim first."
    exit 1
fi

echo "2. Marshaling data..."
# Run marshal
if ! command -v marshal &> /dev/null; then
    echo "Error: marshal is not installed"
    echo "Please install it by running:"
    echo "  cd $ROOT_DIR/rego-sim && cargo install --path . --bin marshal"
    exit 1
fi

marshal "$POLICY_REGO" "$PARAMS_JSON" "$INTENT_JSON" "$REGO_QUERY" "$EVAL_RESULT"

echo "3. Running Rego evaluation..."

# Run regorus
if ! command -v regorus &> /dev/null; then
    echo "Error: regorus is not installed"
    echo "Please install it by running:"
    echo "  cp $ROOT_DIR/rego-sim/lib/regorus ~/.cargo/bin/"
    exit 1
fi


regorus eval --input "$INPUT_JSON" --data "$DATA_JSON" --data "$POLICY_REGO" "$REGO_QUERY"
