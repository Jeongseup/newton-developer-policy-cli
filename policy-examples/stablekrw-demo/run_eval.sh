#!/bin/bash
set -e

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR/../.."

# Configuration
POLICY_REGO="$SCRIPT_DIR/policy-files/policy.rego"
DATA_JSON="$SCRIPT_DIR/intermediary/data.json"
INPUT_JSON="$SCRIPT_DIR/intermediary/input.json"
REGO_QUERY="stablekrw_demo.allow"

# Auto-prefix 'data.' if not present
if [[ "$REGO_QUERY" != data.* ]]; then
  REGO_QUERY="data.$REGO_QUERY"
fi

regorus eval --input "$INPUT_JSON" --data "$DATA_JSON" --data "$POLICY_REGO" "$REGO_QUERY"
