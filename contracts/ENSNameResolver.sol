// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.10;

interface IDefaultResolver {
    function name(bytes32 node) external view returns (string memory);
}

interface IReverseRegistrar {
    function node(address addr) external view returns (bytes32);

    function defaultResolver() external view returns (IDefaultResolver);
}

library ENSNameResolver {
    function lookupENSName(address _address)
        public
        view
        returns (string memory)
    {
        // Goerli
        address REGISTRAR_ADDRESS = 0xD5610A08E370051a01fdfe4bB3ddf5270af1aA48;
        // Mainnet
        // address REGISTRAR_ADDRESS = 0x084b1c3c81545d370f3634392de611caabff8148;

            address OLD_REGISTRAR_ADDRESS
         = 0x9062C0A6Dbd6108336BcBe4593a3D1cE05512069;

        string memory ens = tryLookupENSName(REGISTRAR_ADDRESS, _address);

        if (bytes(ens).length == 0) {
            ens = tryLookupENSName(OLD_REGISTRAR_ADDRESS, _address);
        }

        return ens;
    }

    function tryLookupENSName(address _registrar, address _address)
        public
        view
        returns (string memory)
    {
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
