// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {TipJar} from "../contracts/templates/TipJar.sol";

contract RejectingOwner {
    TipJar public jar;

    function deploy() external {
        jar = new TipJar("Rejector", "");
    }

    function withdraw() external {
        jar.withdraw();
    }
}

contract TipJarTest is Test {
    // Mirrors of the contract's events (0.8.20 can't emit `Contract.Event`).
    event Tipped(uint256 indexed id, address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    TipJar jar;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vm.prank(alice);
        jar = new TipJar("Alice's art", "Thank you!");
        vm.deal(bob, 10 ether);
    }

    function test_Constructor() public view {
        assertEq(jar.owner(), alice);
        assertEq(jar.name(), "Alice's art");
        assertEq(jar.thankYou(), "Thank you!");
        assertEq(jar.MIN_TIP(), 0.001 ether);
    }

    function test_ConstructorValidation() public {
        vm.expectRevert(TipJar.EmptyText.selector);
        new TipJar("", "");
        vm.expectRevert(abi.encodeWithSelector(TipJar.TextTooLong.selector, 64));
        new TipJar(string(new bytes(65)), "");
        vm.expectRevert(abi.encodeWithSelector(TipJar.TextTooLong.selector, 140));
        new TipJar("ok", string(new bytes(141)));
        new TipJar("ok", "");
    }

    function test_Tip() public {
        vm.expectEmit(true, true, false, true);
        emit Tipped(0, bob, 0.01 ether);
        vm.prank(bob);
        jar.tip{value: 0.01 ether}("love it");
        vm.prank(bob);
        jar.tip{value: 0.001 ether}("");

        assertEq(jar.balance(), 0.011 ether);
        assertEq(jar.totalTipped(), 0.011 ether);
        TipJar.Tip[] memory tips = jar.getTips(0, 10);
        assertEq(tips.length, 2);
        assertEq(tips[0].from, bob);
        assertEq(tips[0].note, "love it");
        assertEq(tips[1].amount, 0.001 ether);
    }

    function test_TipTooSmall() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(TipJar.TipTooSmall.selector, 0.001 ether));
        jar.tip{value: 0.001 ether - 1}("");
    }

    function test_NoteTooLong() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(TipJar.TextTooLong.selector, 140));
        jar.tip{value: 0.001 ether}(string(new bytes(141)));
    }

    function test_PlainTransferReverts() public {
        vm.prank(bob);
        (bool ok, ) = address(jar).call{value: 1 ether}("");
        assertFalse(ok);
    }

    function test_OwnerWithdraws() public {
        vm.prank(bob);
        jar.tip{value: 1 ether}("");

        vm.prank(bob);
        vm.expectRevert(TipJar.NotOwner.selector);
        jar.withdraw();

        uint256 before = alice.balance;
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(alice, 1 ether);
        vm.prank(alice);
        jar.withdraw();
        assertEq(alice.balance - before, 1 ether);
        assertEq(jar.balance(), 0);
        assertEq(jar.totalTipped(), 1 ether);
    }

    function test_EmptyWithdraw() public {
        vm.prank(alice);
        vm.expectRevert(TipJar.NothingToWithdraw.selector);
        jar.withdraw();
    }

    function test_TransferFailed() public {
        RejectingOwner rejector = new RejectingOwner();
        rejector.deploy();
        TipJar rjar = rejector.jar();
        vm.prank(bob);
        rjar.tip{value: 0.01 ether}("");
        vm.expectRevert(TipJar.TransferFailed.selector);
        rejector.withdraw();
    }

    function test_SameCodeHashAcrossInstances() public {
        TipJar other = new TipJar("Other", "");
        assertEq(address(other).codehash, address(jar).codehash);
    }
}
