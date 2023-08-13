// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IDefaultResolver {
    function name(bytes32 node) external view returns (string memory);
}

interface IReverseRegistrar {
    function node(address addr) external view returns (bytes32);

    function defaultResolver() external view returns (IDefaultResolver);
}

library ENSNameResolver {
    function lookupENSName(
        address _registrar,
        address _address
    ) public view returns (string memory) {
        uint32 size;
        assembly {
            size := extcodesize(_registrar)
        }
        if (size == 0) {
            return "";
        }
        IReverseRegistrar ensReverseRegistrar = IReverseRegistrar(_registrar);
        bytes32 node = ensReverseRegistrar.node(_address);
        return ensReverseRegistrar.defaultResolver().name(node);
    }
}
