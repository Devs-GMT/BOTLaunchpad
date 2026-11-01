// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {Guestbook} from "../contracts/templates/Guestbook.sol";

contract GuestbookTest is Test {
    // Mirrors of the contract's events (0.8.20 can't emit `Contract.Event`).
    event Signed(uint256 indexed id, address indexed signer);

    Guestbook book;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.prank(alice);
        book = new Guestbook("Devcon booth");
    }

    function test_ConstructorSetsOwnerAndName() public view {
        assertEq(book.owner(), alice);
        assertEq(book.name(), "Devcon booth");
        assertEq(book.TEMPLATE_ID(), 1);
    }

    function test_ConstructorRejectsBadName() public {
        vm.expectRevert(Guestbook.EmptyText.selector);
        new Guestbook("");
        vm.expectRevert(abi.encodeWithSelector(Guestbook.TextTooLong.selector, 64));
        new Guestbook(string(new bytes(65)));
    }

    function test_TwoWalletsSign() public {
        vm.expectEmit(true, true, false, false);
        emit Signed(0, alice);
        vm.prank(alice);
        book.sign("gm");
        vm.prank(bob);
        book.sign("I was here");

        assertEq(book.entryCount(), 2);
        assertTrue(book.hasSigned(bob));
        Guestbook.Entry[] memory page = book.getEntries(0, 10);
        assertEq(page.length, 2);
        assertEq(page[1].signer, bob);
        assertEq(page[1].message, "I was here");
    }

    function test_SignOncePerWallet() public {
        vm.startPrank(bob);
        book.sign("first");
        vm.expectRevert(Guestbook.AlreadySigned.selector);
        book.sign("second");
        vm.stopPrank();
    }

    function test_MessageCaps() public {
        vm.startPrank(bob);
        vm.expectRevert(Guestbook.EmptyText.selector);
        book.sign("");
        vm.expectRevert(abi.encodeWithSelector(Guestbook.TextTooLong.selector, 140));
        book.sign(string(new bytes(141)));
        book.sign(string(new bytes(140)));
        vm.stopPrank();
    }

    function test_PaginationEdges() public {
        vm.prank(alice);
        book.sign("a");
        vm.prank(bob);
        book.sign("b");
        assertEq(book.getEntries(2, 5).length, 0);
        assertEq(book.getEntries(1, type(uint256).max).length, 1);
        assertEq(book.getEntries(0, 1).length, 1);
    }

    function test_SameCodeHashAcrossInstances() public {
        Guestbook other = new Guestbook("Another title entirely");
        assertEq(address(other).codehash, address(book).codehash);
    }
}
