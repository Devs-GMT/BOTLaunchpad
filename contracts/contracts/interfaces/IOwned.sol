// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @notice Minimal view every Launchpad template exposes.
interface IOwned {
    function owner() external view returns (address);
}
