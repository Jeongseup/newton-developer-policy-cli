// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {StableKRW} from "../contracts/StableKRW.sol";

contract DeployStableKRW is Script {
    function run() external returns (StableKRW stableKRW) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        stableKRW = new StableKRW(deployer);

        vm.stopBroadcast();
    }
}
