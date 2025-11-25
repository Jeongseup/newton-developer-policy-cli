# stablekrw-demo

Proof of Reserve Stablecoin Mint Demo POC

## Problem

https://www.pymnts.com/cryptocurrency/2025/paxos-accidentally-mints-300-trillion-excess-paypal-stablecoin/

## Solution

https://docs.newt.foundation/developers

## Example

Koani wants mint sKRW (stable KRW)
Korean government is requiring Koani to hold / acquire 5B KRW on their books in order to mint sKRW
Would be able to mint 1:1 KRW to sKRW (rule hasn’t been passed yet, so may change)
For example, if they hold 5B KRW -> they can mint up to 5B sKRW. If they hold 6B KRW -> they can mint up to 6B KRW
Koani wants to mint sKRW. To do that, they need to prove that they hold the required balance of KRW
Demo
Koani can only mint, if they pass a Newton Policy check that confirms they hold KRW
If they don’t pass the KRW check, then they can’t mint any more
Policy evaluation:
If (total_supply_sKRW < total_KRW_balance) && (total_KRW_balance > 5B KRW) { you can mint_KRW() }
Before you mint, you have to do a Newton Policy check and then that proof get posted on chain
Examples
Koani has 6B KRW. They have minted 5B sKRW already. They can mint up to 1B more sKRW
Koani has 6B KRW. They have minted 6B sKRW already. They can’t mint any more sKRW until they get more KRW.
Newton Oracle Policy
https://engopendart.fss.or.kr/intro/main.do
