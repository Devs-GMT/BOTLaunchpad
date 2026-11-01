// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {Poll} from "../contracts/templates/Poll.sol";

contract PollTest is Test {
    // Mirrors of the contract's events (0.8.20 can't emit `Contract.Event`).
    event Voted(address indexed voter, uint8 indexed option);

    Poll poll;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    uint64 endsAt;

    function _options(uint256 n) internal pure returns (string[] memory opts) {
        opts = new string[](n);
        for (uint256 i = 0; i < n; i++) opts[i] = "opt";
    }

    function setUp() public {
        vm.warp(1_700_000_000);
        endsAt = uint64(block.timestamp + 1 days);
        string[] memory opts = new string[](3);
        opts[0] = "Chips";
        opts[1] = "Fruit";
        opts[2] = "Both";
        vm.prank(alice);
        poll = new Poll("Best snack?", opts, endsAt);
    }

    function test_Constructor() public view {
        assertEq(poll.owner(), alice);
        assertEq(poll.name(), "Best snack?");
        assertEq(poll.endsAt(), endsAt);
        assertEq(poll.getOptions().length, 3);
        assertEq(poll.results().length, 3);
        assertTrue(poll.isOpen());
    }

    function test_ConstructorValidation() public {
        uint64 future = uint64(block.timestamp + 1);
        vm.expectRevert(Poll.BadOptions.selector);
        new Poll("q", _options(1), future);
        vm.expectRevert(Poll.BadOptions.selector);
        new Poll("q", _options(7), future);
        new Poll("q", _options(6), future);

        vm.expectRevert(Poll.EndInPast.selector);
        new Poll("q", _options(2), uint64(block.timestamp));

        vm.expectRevert(Poll.EmptyText.selector);
        new Poll("", _options(2), future);
        vm.expectRevert(abi.encodeWithSelector(Poll.TextTooLong.selector, 120));
        new Poll(string(new bytes(121)), _options(2), future);

        string[] memory longOpt = _options(2);
        longOpt[1] = string(new bytes(49));
        vm.expectRevert(abi.encodeWithSelector(Poll.TextTooLong.selector, 48));
        new Poll("q", longOpt, future);
    }

    function test_TwoWalletsVote() public {
        vm.expectEmit(true, true, false, false);
        emit Voted(alice, 0);
        vm.prank(alice);
        poll.vote(0);
        vm.prank(bob);
        poll.vote(2);

        uint256[] memory r = poll.results();
        assertEq(r[0], 1);
        assertEq(r[1], 0);
        assertEq(r[2], 1);
        assertEq(poll.totalVotes(), 2);
        assertTrue(poll.hasVoted(bob));
    }

    function test_OneVotePerWallet() public {
        vm.startPrank(bob);
        poll.vote(1);
        vm.expectRevert(Poll.AlreadyVoted.selector);
        poll.vote(0);
        vm.stopPrank();
    }

    function test_InvalidOption() public {
        vm.prank(bob);
        vm.expectRevert(Poll.InvalidOption.selector);
        poll.vote(3);
    }

    function test_NoVotesAfterEnd() public {
        vm.warp(endsAt);
        assertFalse(poll.isOpen());
        vm.prank(bob);
        vm.expectRevert(Poll.PollClosed.selector);
        poll.vote(0);
    }

    function test_OwnerCloses() public {
        vm.prank(bob);
        vm.expectRevert(Poll.NotOwner.selector);
        poll.close();

        vm.prank(alice);
        poll.close();
        assertTrue(poll.closed());

        vm.prank(bob);
        vm.expectRevert(Poll.PollClosed.selector);
        poll.vote(0);

        vm.prank(alice);
        vm.expectRevert(Poll.PollClosed.selector);
        poll.close();
    }

    function test_SameCodeHashAcrossInstances() public {
        Poll other = new Poll("Different?", _options(5), uint64(block.timestamp + 5 days));
        assertEq(address(other).codehash, address(poll).codehash);
    }
}
