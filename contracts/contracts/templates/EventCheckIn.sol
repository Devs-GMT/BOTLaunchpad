// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Event Check-in — BOT Launchpad template #5
/// @notice Proof of attendance: one check-in per wallet inside a time window, up to a cap.
contract EventCheckIn {
    struct Attendee {
        address who;
        uint64 at;
    }

    /// @notice Template identifier used by the Launchpad registry.
    uint8 public constant TEMPLATE_ID = 5;
    /// @notice Maximum event name length in bytes.
    uint256 public constant MAX_NAME = 64;
    /// @notice Largest allowed attendee cap.
    uint32 public constant MAX_CAP = 10_000;

    /// @notice The wallet that deployed this check-in.
    address public owner;
    /// @notice Event name.
    string public name;
    /// @notice Check-in opens at this unix time.
    uint64 public startsAt;
    /// @notice Check-in closes at this unix time (exclusive).
    uint64 public endsAt;
    /// @notice Attendee cap.
    uint32 public maxAttendees;
    /// @notice Whether a wallet has checked in.
    mapping(address => bool) public checkedIn;

    Attendee[] private _list;

    /// @notice Emitted on every check-in. `n` is the zero-based attendee index.
    event CheckedIn(uint256 indexed n, address indexed who);

    error EmptyText();
    error TextTooLong(uint256 max);
    error BadWindow();
    error BadMax();
    error NotStarted();
    error Ended();
    error Full();
    error AlreadyCheckedIn();

    /// @param name_ Event name, 1–64 bytes.
    /// @param startsAt_ Opening time.
    /// @param endsAt_ Closing time, after `startsAt_` and in the future.
    /// @param maxAttendees_ 1–10,000.
    constructor(string memory name_, uint64 startsAt_, uint64 endsAt_, uint32 maxAttendees_) {
        uint256 n = bytes(name_).length;
        if (n == 0) revert EmptyText();
        if (n > MAX_NAME) revert TextTooLong(MAX_NAME);
        if (startsAt_ >= endsAt_ || endsAt_ <= block.timestamp) revert BadWindow();
        if (maxAttendees_ == 0 || maxAttendees_ > MAX_CAP) revert BadMax();
        owner = msg.sender;
        name = name_;
        startsAt = startsAt_;
        endsAt = endsAt_;
        maxAttendees = maxAttendees_;
    }

    /// @notice Check in once while the window is open and the cap is not reached.
    function checkIn() external {
        if (block.timestamp < startsAt) revert NotStarted();
        if (block.timestamp >= endsAt) revert Ended();
        if (checkedIn[msg.sender]) revert AlreadyCheckedIn();
        if (_list.length >= maxAttendees) revert Full();
        checkedIn[msg.sender] = true;
        _list.push(Attendee(msg.sender, uint64(block.timestamp)));
        emit CheckedIn(_list.length - 1, msg.sender);
    }

    /// @notice Number of attendees.
    function count() external view returns (uint256) {
        return _list.length;
    }

    /// @notice Window state, attendee count and cap in one call.
    function status() external view returns (bool open, uint256 attendeeCount, uint32 max) {
        attendeeCount = _list.length;
        open = block.timestamp >= startsAt && block.timestamp < endsAt && attendeeCount < maxAttendees;
        max = maxAttendees;
    }

    /// @notice Page through attendees in check-in order.
    function attendees(uint256 from, uint256 count_) external view returns (Attendee[] memory page) {
        uint256 len = _list.length;
        if (from >= len) return page;
        uint256 end = len - from < count_ ? len : from + count_;
        page = new Attendee[](end - from);
        for (uint256 i = from; i < end; i++) page[i - from] = _list[i];
    }
}
