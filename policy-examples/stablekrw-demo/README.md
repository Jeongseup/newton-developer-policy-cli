# Proof of Reserve Stablecoin Mint Demo (sKRW)

This Proof of Concept (POC) demonstrates a "Proof of Reserve" policy for minting a Korean Won stablecoin (sKRW). It ensures that new tokens can only be minted if the issuer holds sufficient off-chain fiat reserves, verified cryptographically via the Newton Protocol.

## 1. The Problem

Stablecoin issuers face significant risks of over-minting or "accidental" minting, as seen in incidents like the **Paxos/PayPal event** where excess tokens were minted without backing.

- [Reference: Paxos Accidentally Mints $300 Trillion Excess PayPal Stablecoin](https://www.pymnts.com/cryptocurrency/2025/paxos-accidentally-mints-300-trillion-excess-paypal-stablecoin/)

Without verifiable on-chain checks of off-chain reserves, trust relies entirely on the issuer's internal controls. A single operational error can lead to catastrophic de-pegging risks.

## 2. The Solution: Newton Protocol

**Newton Protocol** redefines compliance as a programmable, verifiable primitive for decentralized systems. It acts as a decentralized policy engine that enables developers to encode and enforce compliance rules across both on-chain and off-chain systems.

- **Verifiable Execution**: Transforms compliance from a manual process into a verifiable compute primitive.
- **Chain Agnostic**: Integrates with EVM networks (Ethereum, Base, Arbitrum) and plans for non-EVM support.
- **Privacy Preserving**: Validates real-world data (like bank balances) without revealing sensitive raw data on-chain.

[Learn more at Newton Developer Docs](https://docs.newt.foundation/developers)

## 3. Regulatory Compliance Context

South Korea is moving towards institutionalizing stablecoins. New regulations require issuers to hold actual fiat reserves to ensure 1:1 redeemability and financial stability.

- **Requirement**: Issuers must hold a minimum capital (e.g., 5 Billion KRW) and maintain 1:1 backing.
- [Reference: Korean Stablecoin Regulation Article](https://www.hankyung.com/article/2025072871591)

## 4. Demo Scenario: Koani sKRW

**Issuer**: Koani  
**Asset**: sKRW (Stable KRW)  
**Objective**: Mint sKRW tokens on-chain.

### Policy Logic

To comply with regulations and ensure solvency, Koani can only mint sKRW if they pass a Newton Policy check.

**The Policy Rule:**

```
IF (Total_KRW_Reserves > 5,000,000,000 KRW) AND (Total_Supply_sKRW < Total_KRW_Reserves)
THEN ALLOW mint()
```

### Workflow

1.  **Request**: Koani initiates a transaction to mint sKRW.
2.  **Verification**:
    - A Newton Policy fetches Koani's real-time financial data from **OpenDART** (Korea's Financial Supervisory Service API).
    - It verifies the `Total Equity` (Capital) and `Cash Reserves`.
3.  **Enforcement**:
    - If `Reserves > 5B KRW` and `Reserves > Current Supply`, the policy generates a validity proof.
    - The smart contract verifies the proof and allows the minting.
    - If the check fails (e.g., insufficient reserves), the transaction is blocked.

### Examples

- **Scenario A (Allowed)**:

  - Reserves: 6B KRW
  - Current Supply: 5B sKRW
  - Action: Mint 1B sKRW -> **ALLOWED** (New Supply 6B <= Reserves 6B)

- **Scenario B (Blocked)**:
  - Reserves: 6B KRW
  - Current Supply: 6B sKRW
  - Action: Mint 1 sKRW -> **DENIED** (Would exceed reserves)

## 5. Technical Implementation

- **Data Source**: [OpenDART API](https://engopendart.fss.or.kr/intro/main.do) (Financial Supervisory Service)
- **Policy Engine**: Newton (WASM + Rego)
- **Verification**: Off-chain data fetch & ZK/Validity Proof generation.

### Running the Demo

```bash
# Run the full simulation (WASM fetch + Rego evaluation)
./run_rego_sim.sh
```
