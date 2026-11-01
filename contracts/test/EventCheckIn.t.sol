// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {EventCheckIn} from "../contracts/templates/EventCheckIn.sol";

contract EventCheckInTest is Test {
    // Mirrors of the contract's events (0.8.20 can't emit `Contract.Event`).
    event CheckedIn(uint256 indexed n, address indexed who);

    EventCheckIn ev;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carol = makeAddr("carol");
    uint64 startsAt;
    uint64 endsAt;

    function setUp() public {
        vm.warp(1_700_000_000);
        startsAt = uint64(block.timestamp + 1 hours);
        endsAt = uint64(block.timestamp + 3 hours);
        vm.prank(alice);
        ev = new EventCheckIn("Meetup #4", startsAt, endsAt, 2);
    }

    function test_Constructor() public view {
        assertEq(ev.owner(), alice);
        assertEq(ev.name(), "Meetup #4");
        assertEq(ev.startsAt(), startsAt);
        assertEq(ev.endsAt(), endsAt);
        assertEq(ev.maxAttendees(), 2);
    }

    function test_ConstructorValidation() public {
        uint64 nowTs = uint64(block.timestamp);
        vm.expectRevert(EventCheckIn.EmptyText.selector);
        new EventCheckIn("", nowTs, nowTs + 1, 1);
        vm.expectRevert(abi.encodeWithSelector(EventCheckIn.TextTooLong.selector, 64));
        new EventCheckIn(string(new bytes(65)), nowTs, nowTs + 1, 1);
        vm.expectRevert(EventCheckIn.BadWindow.selector);
        new EventCheckIn("x", nowTs + 2, nowTs + 1, 1);
        vm.expectRevert(EventCheckIn.BadWindow.selector);
        new EventCheckIn("x", nowTs - 10, nowTs, 1);
        vm.expectRevert(EventCheckIn.BadMax.selector);
        new EventCheckIn("x", nowTs, nowTs + 1, 0);
        vm.expectRevert(EventCheckIn.BadMax.selector);
        new EventCheckIn("x", nowTs, nowTs + 1, 10_001);
        new EventCheckIn("x", nowTs, nowTs + 1, 10_000);
    }

    function test_BeforeWindow() public {
        vm.prank(bob);
        vm.expectRevert(EventCheckIn.NotStarted.selector);
        ev.checkIn();
        (bool open, , ) = ev.status();
        assertFalse(open);
    }

    function test_InsideWindowTwoWallets() public {
        vm.warp(startsAt);
        vm.expectEmit(true, true, false, false);
        emit CheckedIn(0, bob);
        vm.prank(bob);
        ev.checkIn();
        vm.prank(carol);
        ev.checkIn();

        assertEq(ev.count(), 2);
        assertTrue(ev.checkedIn(carol));
        EventCheckIn.Attendee[] memory list = ev.attendees(0, 10);
        assertEq(list.length, 2);
        assertEq(list[1].who, carol);
        assertEq(list[0].at, startsAt);
    }

    function test_OncePerWallet() public {
        vm.warp(startsAt);
        vm.startPrank(bob);
        ev.checkIn();
        vm.expectRevert(EventCheckIn.AlreadyCheckedIn.selector);
        ev.checkIn();
        vm.stopPrank();
    }

    function test_Cap() public {
        vm.warp(startsAt);
        vm.prank(bob);
        ev.checkIn();
        vm.prank(carol);
        ev.checkIn();
        (bool open, uint256 n, uint32 max) = ev.status();
        assertFalse(open);
        assertEq(n, 2);
        assertEq(max, 2);
        vm.prank(alice);
        vm.expectRevert(EventCheckIn.Full.selector);
        ev.checkIn();
    }

    function test_AfterWindow() public {
        vm.warp(endsAt);
        vm.prank(bob);
        vm.expectRevert(EventCheckIn.Ended.selector);
        ev.checkIn();
    }

    function test_PaginationEdges() public {
        vm.warp(startsAt);
        vm.prank(bob);
        ev.checkIn();
        assertEq(ev.attendees(1, 5).length, 0);
        assertEq(ev.attendees(0, type(uint256).max).length, 1);
    }

    function test_SameCodeHashAcrossInstances() public {
        EventCheckIn other = new EventCheckIn("Other", startsAt, endsAt + 5 days, 500);
        assertEq(address(other).codehash, address(ev).codehash);
    }
}
