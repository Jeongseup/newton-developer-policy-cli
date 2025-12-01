import { privateKeyToAccount } from "viem/accounts";
import {
  createWalletClient,
  createPublicClient,
  publicActions,
  webSocket,
  encodeFunctionData,
  toHex,
} from "viem";
import { sepolia } from "viem/chains";
import {
  newtonWalletClientActions,
  newtonPublicClientActions,
} from "@magicnewton/newton-protocol-sdk";
import { TaskResponseResult } from "@magicnewton/newton-protocol-sdk/dist/types/types/task";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load environment variables from .env file in the project root
const envPath = path.resolve(__dirname, "../../../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const WEB_SOCKET_URL = process.env.WEB_SOCKET_URL || process.env.RPC_URL; // Fallback to RPC if WS not set, though code uses webSocket()
const POLICY_CLIENT_ADDRESS = process.env
  .POLICY_CLIENT_ADDRESS as `0x${string}`;
const STABLE_KRW_ADDRESS = process.env.STABLE_KRW_ADDRESS as `0x${string}`;

if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY env var");
if (!WEB_SOCKET_URL)
  throw new Error("Missing WEB_SOCKET_URL or RPC_URL env var");
if (!POLICY_CLIENT_ADDRESS)
  throw new Error("Missing POLICY_CLIENT_ADDRESS env var");
if (!STABLE_KRW_ADDRESS) throw new Error("Missing STABLE_KRW_ADDRESS env var");

const signer = privateKeyToAccount(PRIVATE_KEY);
const connectedAddress = signer.address;

console.log("Signer address:", connectedAddress);

export const walletClient = createWalletClient({
  chain: sepolia,
  transport: webSocket(WEB_SOCKET_URL),
  account: signer,
})
  .extend(publicActions)
  .extend(newtonWalletClientActions());

const publicClient = createPublicClient({
  chain: sepolia,
  transport: webSocket(WEB_SOCKET_URL),
}).extend(
  newtonPublicClientActions({
    policyContractAddress: POLICY_CLIENT_ADDRESS,
  })
);

function stringToHexBytes(str: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const toAddress = STABLE_KRW_ADDRESS;

const wasmArgsPath = path.resolve(__dirname, "../policy-files/wasm_args.json");
const wasmArgsExamplePath = path.resolve(
  __dirname,
  "../policy-files/wasm_args.json.example"
);
const finalWasmArgsPath = fs.existsSync(wasmArgsPath)
  ? wasmArgsPath
  : wasmArgsExamplePath;

console.log("Loading wasmArgs from:", finalWasmArgsPath);
const wasmArgsContent = fs.readFileSync(finalWasmArgsPath, "utf-8");
const wasmArgs = stringToHexBytes(wasmArgsContent);

const mintAbi = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const mintAmount = 5n * 1_000_000_000n * 10n ** 18n; // 5 billion KRW (18 decimals)
const data = encodeFunctionData({
  abi: mintAbi,
  functionName: "mint",
  args: [toAddress, mintAmount],
});

const functionSignatureString = "mint(address,uint256)";
const functionSignature = toHex(functionSignatureString);

// Construct the intent.
const intentCode = `{
  "policyClient": "${POLICY_CLIENT_ADDRESS}",
  "intent": {
      "from": "${connectedAddress}",
      "to": "${toAddress}",
      "value": "0x0",
      "data": "${data}",
      "chainId": 11155111,
      "functionSignature": "${functionSignature}"
  },
  "timeout": 60,
  "wasmArgs": "${wasmArgs}"
}`;

console.log("Submitting evaluation request...");
console.log("Intent:", intentCode);

async function main() {
  try {
    const pendingTask = await walletClient.submitEvaluationRequest(
      JSON.parse(intentCode)
    );

    console.log("Task submitted. Task ID:", pendingTask.result.taskId);
    console.log("Waiting for response...");

    const response: TaskResponseResult =
      await publicClient.waitForTaskResponded({
        taskId: pendingTask.result.taskId,
        timeoutMs: 20_000,
      });

    console.log("evaluation result: ", response.taskResponse.evaluationResult);
    console.log("attestation: ", response.attestation);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
