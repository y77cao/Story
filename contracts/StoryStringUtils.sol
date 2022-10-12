// SPDX-License-Identifier: MIT
// Modified from source:
// https://github.com/ensdomains/ens-contracts/blob/master/contracts/ethregistrar/StoryStringUtils.sol
pragma solidity ^0.8.4;

import "github.com/Arachnid/solidity-stringutils/src/strings.sol";

library StoryStringUtils {
    using strings for *;

    uint256 public constant MAX_CHARS_PER_MINT = 280;
    uint256 public constant MAX_CHARS_PER_LINE = 56;

    function strlen(string memory s) public pure returns (uint256) {
        return s.toSlice().len();
    }

    function validate(string memory s) public pure returns (bool) {
        bytes memory sInBytes = bytes(s);
        if (strlen(s) <= 0 || strlen(s) > MAX_CHARS_PER_MINT) return false;
        uint16 nextInd = 1;
        for (uint16 i = 0; i < sInBytes.length; i++) {
            bytes1 c = sInBytes[i];
            if (
                nextInd < sInBytes.length &&
                sInBytes[nextInd] == 0x20 &&
                c == sInBytes[nextInd]
            ) return false; // consecutive spaces
            if (
                !(c >= 0x30 && c <= 0x39) && //9-0
                !(c >= 0x41 && c <= 0x5A) && //A-Z
                !(c >= 0x61 && c <= 0x7A) && //a-z
                !(c == 0x2E) && //.
                !(c == 0x3F) && //?
                !(c == 0x20) // space
            ) return false;
            nextInd++;
        }
        return true;
    }

    function textWrap(string memory s) public pure returns (string[] memory) {
        strings.slice memory sl = s.toSlice();
        strings.slice memory delim = " ".toSlice();
        strings.slice[] memory parts = new strings.slice[](sl.count(delim) + 1);
        for (uint16 i = 0; i < parts.length; i++) {
            parts[i] = sl.split(delim);
        }

        uint256 lines = strlen(s) / MAX_CHARS_PER_LINE + 1;
        uint256[] memory endInds = new uint256[](lines);
        endInds[0] = parts[0].len();
        uint16 currLineNumber = 0;

        for (uint16 i = 1; i < parts.length; i++) {
            uint256 partLen = parts[i].len();
            if (partLen + endInds[currLineNumber] + 1 <= MAX_CHARS_PER_LINE) {
                endInds[currLineNumber] += partLen + 1;
            } else {
                currLineNumber++;
                if (currLineNumber < lines)
                    endInds[currLineNumber] += partLen + 1;
                else endInds[currLineNumber - 1] += partLen + 1;
            }
        }

        // return endInds;

        string[] memory wrappedText = new string[](
            strlen(s) / MAX_CHARS_PER_LINE + 1
        );
        uint256 startIndex = 0;
        uint256 endIndex = 0;
        for (uint16 i = 0; i < endInds.length; i++) {
            endIndex += endInds[i];
            wrappedText[i] = substring(s, startIndex, endIndex);
            startIndex = endIndex;
        }

        return wrappedText;
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint8 i; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function bytes32ToString(bytes32 x) public pure returns (string memory) {
        uint256 numChars = 0;

        for (uint256 i; i < 32; i++) {
            if (x[i] == bytes1(0)) break;
            numChars++;
        }

        bytes memory result = new bytes(numChars);
        for (uint256 i; i < numChars; i++) result[i] = x[i];

        return string(result);
    }

    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}
