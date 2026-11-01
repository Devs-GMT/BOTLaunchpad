// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Guestbook — BOT Launchpad template #1
/// @notice Anyone can sign once with a short message.
contract Guestbook {
    struct Entry {
        address signer;
        uint64 at;
        string message;
    }

    /// @notice Template identifier used by the Launchpad registry.
    uint8 public constant TEMPLATE_ID = 1;
    /// @notice Maximum title length in bytes.
    uint256 public constant MAX_NAME = 64;
    /// @notice Maximum message length in bytes.
    uint256 public constant MAX_MESSAGE = 140;

    /// @notice The wallet that deployed this guestbook.
    address public owner;
    /// @notice Guestbook title.
    string public name;
    /// @notice Whether a wallet has already signed.
    mapping(address => bool) public hasSigned;

    Entry[] private _entries;

    /// @notice Emitted when a wallet signs the guestbook.
    event Signed(uint256 indexed id, address indexed signer);

    error EmptyText();
    error TextTooLong(uint256 max);
    error AlreadySigned();

    /// @param name_ Guestbook title, 1–64 bytes.
    constructor(string memory name_) {
        _checkText(name_, MAX_NAME);
        owner = msg.sender;
        name = name_;
    }

    /// @notice Sign the guestbook. One signature per wallet.
    /// @param message 1–140 bytes.
    function sign(string calldata message) external {
        if (hasSigned[msg.sender]) revert AlreadySigned();
        _checkText(message, MAX_MESSAGE);
        hasSigned[msg.sender] = true;
        _entries.push(Entry(msg.sender, uint64(block.timestamp), message));
        emit Signed(_entries.length - 1, msg.sender);
    }

    /// @notice Number of entries.
    function entryCount() external view returns (uint256) {
        return _entries.length;
    }

    /// @notice Page through entries in insertion order.
    /// @param from First index. Returns an empty array when out of range.
    /// @param count Maximum number of entries to return.
    function getEntries(uint256 from, uint256 count) external view returns (Entry[] memory page) {
        uint256 len = _entries.length;
        if (from >= len) return page;
        uint256 end = len - from < count ? len : from + count;
        page = new Entry[](end - from);
        for (uint256 i = from; i < end; i++) page[i - from] = _entries[i];
    }

    function _checkText(string memory s, uint256 max) private pure {
        uint256 n = bytes(s).length;
        if (n == 0) revert EmptyText();
        if (n > max) revert TextTooLong(max);
    }
}
