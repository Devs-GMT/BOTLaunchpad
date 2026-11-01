// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title Poll — BOT Launchpad template #2
/// @notice One vote per wallet until the end time or until the owner closes it.
contract Poll {
    /// @notice Template identifier used by the Launchpad registry.
    uint8 public constant TEMPLATE_ID = 2;
    /// @notice Maximum question length in bytes.
    uint256 public constant MAX_NAME = 120;
    /// @notice Maximum option label length in bytes.
    uint256 public constant MAX_OPTION = 48;
    /// @notice Minimum number of options.
    uint256 public constant MIN_OPTIONS = 2;
    /// @notice Maximum number of options.
    uint256 public constant MAX_OPTIONS = 6;

    /// @notice The wallet that deployed this poll.
    address public owner;
    /// @notice The poll question.
    string public name;
    /// @notice Unix time after which voting stops.
    uint64 public endsAt;
    /// @notice True once the owner closes the poll early.
    bool public closed;
    /// @notice Whether a wallet has voted.
    mapping(address => bool) public hasVoted;

    string[] private _options;
    uint256[] private _votes;
    uint256 private _total;

    /// @notice Emitted on every vote.
    event Voted(address indexed voter, uint8 indexed option);
    /// @notice Emitted when the owner closes the poll.
    event Closed(address indexed by);

    error EmptyText();
    error TextTooLong(uint256 max);
    error BadOptions();
    error EndInPast();
    error PollClosed();
    error AlreadyVoted();
    error InvalidOption();
    error NotOwner();

    /// @param question 1–120 bytes.
    /// @param options_ 2–6 labels of 1–48 bytes each.
    /// @param endsAt_ Unix time in the future.
    constructor(string memory question, string[] memory options_, uint64 endsAt_) {
        _checkText(question, MAX_NAME);
        uint256 n = options_.length;
        if (n < MIN_OPTIONS || n > MAX_OPTIONS) revert BadOptions();
        for (uint256 i = 0; i < n; i++) _checkText(options_[i], MAX_OPTION);
        if (endsAt_ <= block.timestamp) revert EndInPast();

        owner = msg.sender;
        name = question;
        endsAt = endsAt_;
        _options = options_;
        _votes = new uint256[](n);
    }

    /// @notice Cast one vote.
    /// @param option Index into `getOptions()`.
    function vote(uint8 option) external {
        if (!isOpen()) revert PollClosed();
        if (hasVoted[msg.sender]) revert AlreadyVoted();
        if (option >= _options.length) revert InvalidOption();
        hasVoted[msg.sender] = true;
        _votes[option] += 1;
        _total += 1;
        emit Voted(msg.sender, option);
    }

    /// @notice Close the poll before its end time. Owner only.
    function close() external {
        if (msg.sender != owner) revert NotOwner();
        if (!isOpen()) revert PollClosed();
        closed = true;
        emit Closed(msg.sender);
    }

    /// @notice True while votes are accepted.
    function isOpen() public view returns (bool) {
        return !closed && block.timestamp < endsAt;
    }

    /// @notice Option labels in index order.
    function getOptions() external view returns (string[] memory) {
        return _options;
    }

    /// @notice Vote counts in option order.
    function results() external view returns (uint256[] memory) {
        return _votes;
    }

    /// @notice Total votes cast.
    function totalVotes() external view returns (uint256) {
        return _total;
    }

    function _checkText(string memory s, uint256 max) private pure {
        uint256 n = bytes(s).length;
        if (n == 0) revert EmptyText();
        if (n > max) revert TextTooLong(max);
    }
}
