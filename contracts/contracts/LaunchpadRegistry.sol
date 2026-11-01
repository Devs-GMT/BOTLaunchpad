// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IOwned} from "./interfaces/IOwned.sol";

/// @title LaunchpadRegistry — public feed of contracts launched with BOT Launchpad
/// @notice Lists a contract only if its runtime code matches a Launchpad template and the caller owns it.
/// @dev No admin, no fees, no upgrades. A new template set ships as a new registry.
contract LaunchpadRegistry {
    struct Launch {
        address contractAddr;
        address owner;
        uint8 templateId;
        string name;
        uint64 at;
    }

    /// @notice Number of templates this registry knows (ids 1..TEMPLATE_COUNT).
    uint8 public constant TEMPLATE_COUNT = 5;
    /// @notice Maximum feed name length in bytes.
    uint256 public constant MAX_NAME = 64;

    /// @notice Runtime code hash for each template id.
    mapping(uint8 => bytes32) public templateCodeHash;
    /// @notice 1-based launch id per contract; 0 means not registered.
    mapping(address => uint256) public idOf;
    /// @notice Registered launches per template id.
    mapping(uint8 => uint256) public countByTemplate;

    Launch[] private _launches;
    mapping(address => uint256[]) private _byOwner;

    /// @notice Emitted when a contract is listed. `id` is 1-based.
    event Launched(uint256 indexed id, address indexed contractAddr, address indexed owner, uint8 templateId);

    error UnknownTemplate();
    error NotAContract();
    error CodeMismatch();
    error NotOwner();
    error AlreadyRegistered();
    error EmptyName();
    error NameTooLong(uint256 max);

    /// @param hashes Runtime code hashes; index 0 is template id 1.
    constructor(bytes32[5] memory hashes) {
        for (uint8 i = 0; i < TEMPLATE_COUNT; i++) templateCodeHash[i + 1] = hashes[i];
    }

    /// @notice List a contract you own in the Launchpad feed.
    /// @param c The deployed template contract.
    /// @param templateId Template id (1–5) the contract was deployed from.
    /// @param name Display name for the feed, 1–64 bytes.
    /// @return id 1-based launch id.
    function register(address c, uint8 templateId, string calldata name) external returns (uint256 id) {
        if (templateId == 0 || templateId > TEMPLATE_COUNT) revert UnknownTemplate();
        if (c.code.length == 0) revert NotAContract();
        if (c.codehash != templateCodeHash[templateId]) revert CodeMismatch();
        if (idOf[c] != 0) revert AlreadyRegistered();
        if (IOwned(c).owner() != msg.sender) revert NotOwner();
        uint256 n = bytes(name).length;
        if (n == 0) revert EmptyName();
        if (n > MAX_NAME) revert NameTooLong(MAX_NAME);

        _launches.push(Launch(c, msg.sender, templateId, name, uint64(block.timestamp)));
        id = _launches.length;
        idOf[c] = id;
        _byOwner[msg.sender].push(id);
        countByTemplate[templateId] += 1;
        emit Launched(id, c, msg.sender, templateId);
    }

    /// @notice Total registered launches.
    function total() external view returns (uint256) {
        return _launches.length;
    }

    /// @notice Launch by 1-based id.
    function launchAt(uint256 id) external view returns (Launch memory) {
        return _launches[id - 1];
    }

    /// @notice Page through launches in registration order (0-based `from`).
    function getLaunches(uint256 from, uint256 count) external view returns (Launch[] memory page) {
        uint256 len = _launches.length;
        if (from >= len) return page;
        uint256 end = len - from < count ? len : from + count;
        page = new Launch[](end - from);
        for (uint256 i = from; i < end; i++) page[i - from] = _launches[i];
    }

    /// @notice Every launch registered by `owner`.
    function launchesOf(address owner) external view returns (Launch[] memory list) {
        uint256[] storage ids = _byOwner[owner];
        list = new Launch[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) list[i] = _launches[ids[i] - 1];
    }

    /// @notice Total and per-template counts; index 0 is template id 1.
    function stats() external view returns (uint256 totalLaunches, uint256[5] memory perTemplate) {
        totalLaunches = _launches.length;
        for (uint8 i = 0; i < TEMPLATE_COUNT; i++) perTemplate[i] = countByTemplate[i + 1];
    }

    /// @notice True if `c` is registered here.
    function isLaunchpad(address c) external view returns (bool) {
        return idOf[c] != 0;
    }
}
