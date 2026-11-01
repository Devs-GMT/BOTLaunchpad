// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Tip Jar — BOT Launchpad template #4
/// @notice Collect BOT tips with short notes. Only the owner can withdraw.
/// @dev No receive/fallback: plain transfers revert, so every tip goes through `tip`.
contract TipJar {
    struct Tip {
        address from;
        uint256 amount;
        uint64 at;
        string note;
    }

    /// @notice Template identifier used by the Launchpad registry.
    uint8 public constant TEMPLATE_ID = 4;
    /// @notice Maximum name length in bytes.
    uint256 public constant MAX_NAME = 64;
    /// @notice Maximum thank-you message and note length in bytes.
    uint256 public constant MAX_NOTE = 140;
    /// @notice Smallest accepted tip.
    uint256 public constant MIN_TIP = 0.001 ether;

    /// @notice The wallet that deployed this jar and receives withdrawals.
    address public owner;
    /// @notice Jar name.
    string public name;
    /// @notice Message shown to tippers.
    string public thankYou;
    /// @notice Sum of all tips ever received.
    uint256 public totalTipped;

    Tip[] private _tips;

    /// @notice Emitted on every tip.
    event Tipped(uint256 indexed id, address indexed from, uint256 amount);
    /// @notice Emitted when the owner withdraws.
    event Withdrawn(address indexed to, uint256 amount);

    error EmptyText();
    error TextTooLong(uint256 max);
    error TipTooSmall(uint256 min);
    error NotOwner();
    error NothingToWithdraw();
    error TransferFailed();

    /// @param name_ Jar name, 1–64 bytes.
    /// @param thankYou_ Thank-you message, 0–140 bytes.
    constructor(string memory name_, string memory thankYou_) {
        uint256 n = bytes(name_).length;
        if (n == 0) revert EmptyText();
        if (n > MAX_NAME) revert TextTooLong(MAX_NAME);
        if (bytes(thankYou_).length > MAX_NOTE) revert TextTooLong(MAX_NOTE);
        owner = msg.sender;
        name = name_;
        thankYou = thankYou_;
    }

    /// @notice Send a tip of at least `MIN_TIP`.
    /// @param note Optional note, 0–140 bytes.
    function tip(string calldata note) external payable {
        if (msg.value < MIN_TIP) revert TipTooSmall(MIN_TIP);
        if (bytes(note).length > MAX_NOTE) revert TextTooLong(MAX_NOTE);
        totalTipped += msg.value;
        _tips.push(Tip(msg.sender, msg.value, uint64(block.timestamp), note));
        emit Tipped(_tips.length - 1, msg.sender, msg.value);
    }

    /// @notice Send the whole balance to the owner. Owner only.
    function withdraw() external {
        if (msg.sender != owner) revert NotOwner();
        uint256 amount = address(this).balance;
        if (amount == 0) revert NothingToWithdraw();
        emit Withdrawn(msg.sender, amount);
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /// @notice Current balance waiting to be withdrawn.
    function balance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Number of tips.
    function tipCount() external view returns (uint256) {
        return _tips.length;
    }

    /// @notice Page through tips in insertion order.
    function getTips(uint256 from, uint256 count) external view returns (Tip[] memory page) {
        uint256 len = _tips.length;
        if (from >= len) return page;
        uint256 end = len - from < count ? len : from + count;
        page = new Tip[](end - from);
        for (uint256 i = from; i < end; i++) page[i - from] = _tips[i];
    }
}
