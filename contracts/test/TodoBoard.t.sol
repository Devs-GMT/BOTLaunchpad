// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TodoBoard} from "../contracts/templates/TodoBoard.sol";

contract TodoBoardTest is Test {
    // Mirrors of the contract's events (0.8.20 can't emit `Contract.Event`).
    event TaskAdded(uint256 indexed id, address indexed creator);
    event TaskToggled(uint256 indexed id, address indexed by, bool done);

    TodoBoard closedBoard;
    TodoBoard openBoard;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");

    function setUp() public {
        vm.startPrank(alice);
        closedBoard = new TodoBoard("Only me", false);
        openBoard = new TodoBoard("Hackathon", true);
        vm.stopPrank();
    }

    function test_Constructor() public view {
        assertEq(openBoard.owner(), alice);
        assertEq(openBoard.name(), "Hackathon");
        assertTrue(openBoard.openToAll());
        assertFalse(closedBoard.openToAll());
    }

    function test_ConstructorRejectsBadName() public {
        vm.expectRevert(TodoBoard.EmptyText.selector);
        new TodoBoard("", true);
        vm.expectRevert(abi.encodeWithSelector(TodoBoard.TextTooLong.selector, 64));
        new TodoBoard(string(new bytes(65)), true);
    }

    function test_ClosedBoardOnlyOwnerAdds() public {
        vm.prank(bob);
        vm.expectRevert(TodoBoard.NotAllowed.selector);
        closedBoard.addTask("sneak in");

        vm.prank(alice);
        closedBoard.addTask("ship it");
        assertEq(closedBoard.taskCount(), 1);
    }

    function test_OpenBoardAnyoneAdds() public {
        vm.expectEmit(true, true, false, false);
        emit TaskAdded(0, bob);
        vm.prank(bob);
        openBoard.addTask("design");
        vm.prank(carol);
        openBoard.addTask("contracts");

        TodoBoard.Task[] memory tasks = openBoard.getTasks(0, 10);
        assertEq(tasks.length, 2);
        assertEq(tasks[0].creator, bob);
        assertEq(tasks[1].text, "contracts");
        assertFalse(tasks[1].done);
    }

    function test_TogglePermissions() public {
        vm.prank(bob);
        openBoard.addTask("bob's task");

        vm.prank(carol);
        vm.expectRevert(TodoBoard.NotAllowed.selector);
        openBoard.toggle(0);

        vm.expectEmit(true, true, false, true);
        emit TaskToggled(0, bob, true);
        vm.prank(bob);
        openBoard.toggle(0);

        vm.prank(alice);
        openBoard.toggle(0);
        assertFalse(openBoard.getTasks(0, 1)[0].done);
    }

    function test_ToggleMissingTask() public {
        vm.prank(alice);
        vm.expectRevert(TodoBoard.NoSuchTask.selector);
        openBoard.toggle(0);
    }

    function test_TaskCaps() public {
        vm.startPrank(bob);
        vm.expectRevert(TodoBoard.EmptyText.selector);
        openBoard.addTask("");
        vm.expectRevert(abi.encodeWithSelector(TodoBoard.TextTooLong.selector, 120));
        openBoard.addTask(string(new bytes(121)));
        vm.stopPrank();
    }

    function test_PaginationEdges() public {
        vm.prank(bob);
        openBoard.addTask("one");
        assertEq(openBoard.getTasks(1, 5).length, 0);
        assertEq(openBoard.getTasks(0, type(uint256).max).length, 1);
    }

    function test_SameCodeHashAcrossInstances() public view {
        assertEq(address(openBoard).codehash, address(closedBoard).codehash);
    }
}
