// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/// @title To-do Board — BOT Launchpad template #3
/// @notice A shared task list. The owner decides whether anyone can add tasks.
contract TodoBoard {
    struct Task {
        address creator;
        bool done;
        uint64 at;
        string text;
    }

    /// @notice Template identifier used by the Launchpad registry.
    uint8 public constant TEMPLATE_ID = 3;
    /// @notice Maximum board name length in bytes.
    uint256 public constant MAX_NAME = 64;
    /// @notice Maximum task length in bytes.
    uint256 public constant MAX_TASK = 120;

    /// @notice The wallet that deployed this board.
    address public owner;
    /// @notice Board name.
    string public name;
    /// @notice When true, any wallet can add tasks. Otherwise only the owner can.
    bool public openToAll;

    Task[] private _tasks;

    /// @notice Emitted when a task is added.
    event TaskAdded(uint256 indexed id, address indexed creator);
    /// @notice Emitted when a task is marked done or not done.
    event TaskToggled(uint256 indexed id, address indexed by, bool done);

    error EmptyText();
    error TextTooLong(uint256 max);
    error NotAllowed();
    error NoSuchTask();

    /// @param name_ Board name, 1–64 bytes.
    /// @param openToAll_ Whether any wallet can add tasks.
    constructor(string memory name_, bool openToAll_) {
        _checkText(name_, MAX_NAME);
        owner = msg.sender;
        name = name_;
        openToAll = openToAll_;
    }

    /// @notice Add a task.
    /// @param text 1–120 bytes.
    function addTask(string calldata text) external {
        if (!openToAll && msg.sender != owner) revert NotAllowed();
        _checkText(text, MAX_TASK);
        _tasks.push(Task(msg.sender, false, uint64(block.timestamp), text));
        emit TaskAdded(_tasks.length - 1, msg.sender);
    }

    /// @notice Flip a task between done and not done. Owner or task creator only.
    function toggle(uint256 id) external {
        if (id >= _tasks.length) revert NoSuchTask();
        Task storage t = _tasks[id];
        if (msg.sender != owner && msg.sender != t.creator) revert NotAllowed();
        t.done = !t.done;
        emit TaskToggled(id, msg.sender, t.done);
    }

    /// @notice Number of tasks.
    function taskCount() external view returns (uint256) {
        return _tasks.length;
    }

    /// @notice Page through tasks in insertion order.
    function getTasks(uint256 from, uint256 count) external view returns (Task[] memory page) {
        uint256 len = _tasks.length;
        if (from >= len) return page;
        uint256 end = len - from < count ? len : from + count;
        page = new Task[](end - from);
        for (uint256 i = from; i < end; i++) page[i - from] = _tasks[i];
    }

    function _checkText(string memory s, uint256 max) private pure {
        uint256 n = bytes(s).length;
        if (n == 0) revert EmptyText();
        if (n > max) revert TextTooLong(max);
    }
}
