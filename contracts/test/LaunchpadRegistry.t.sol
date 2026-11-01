// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Test} from "forge-std/Test.sol";
import {LaunchpadRegistry} from "../contracts/LaunchpadRegistry.sol";
import {Guestbook} from "../contracts/templates/Guestbook.sol";
import {Poll} from "../contracts/templates/Poll.sol";
import {TodoBoard} from "../contracts/templates/TodoBoard.sol";
import {TipJar} from "../contracts/templates/TipJar.sol";
import {EventCheckIn} from "../contracts/templates/EventCheckIn.sol";

/// Looks like a template (same `owner()` view) but has different code.
contract FakeOwned {
    address public owner;
    uint8 public constant TEMPLATE_ID = 1;

    constructor() {
        owner = msg.sender;
    }
}

contract LaunchpadRegistryTest is Test {
    event Launched(uint256 indexed id, address indexed contractAddr, address indexed owner, uint8 templateId);

    LaunchpadRegistry registry;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function _hashes() internal returns (bytes32[5] memory h) {
        string[] memory opts = new string[](2);
        opts[0] = "a";
        opts[1] = "b";
        h[0] = address(new Guestbook("x")).codehash;
        h[1] = address(new Poll("q", opts, uint64(block.timestamp + 1))).codehash;
        h[2] = address(new TodoBoard("x", true)).codehash;
        h[3] = address(new TipJar("x", "")).codehash;
        h[4] = address(new EventCheckIn("x", uint64(block.timestamp), uint64(block.timestamp + 1), 1)).codehash;
    }

    function setUp() public {
        vm.warp(1_700_000_000);
        registry = new LaunchpadRegistry(_hashes());
    }

    function _guestbookBy(address who) internal returns (address) {
        vm.prank(who);
        return address(new Guestbook("Booth"));
    }

    function test_ConstructorStoresHashes() public {
        bytes32[5] memory h = _hashes();
        for (uint8 i = 0; i < 5; i++) assertEq(registry.templateCodeHash(i + 1), h[i]);
        assertEq(registry.templateCodeHash(0), bytes32(0));
    }

    function test_RegisterRealTemplate() public {
        address gb = _guestbookBy(alice);
        vm.expectEmit(true, true, true, true);
        emit Launched(1, gb, alice, 1);
        vm.prank(alice);
        uint256 id = registry.register(gb, 1, "Booth");

        assertEq(id, 1);
        assertEq(registry.idOf(gb), 1);
        assertTrue(registry.isLaunchpad(gb));
        assertEq(registry.total(), 1);
        LaunchpadRegistry.Launch memory l = registry.launchAt(1);
        assertEq(l.contractAddr, gb);
        assertEq(l.owner, alice);
        assertEq(l.templateId, 1);
        assertEq(l.name, "Booth");
        assertEq(l.at, block.timestamp);
    }

    function test_EveryTemplateRegisters() public {
        string[] memory opts = new string[](2);
        opts[0] = "a";
        opts[1] = "b";
        vm.startPrank(alice);
        registry.register(address(new Guestbook("g")), 1, "g");
        registry.register(address(new Poll("p", opts, uint64(block.timestamp + 1 days))), 2, "p");
        registry.register(address(new TodoBoard("t", false)), 3, "t");
        registry.register(address(new TipJar("j", "ty")), 4, "j");
        registry.register(
            address(new EventCheckIn("e", uint64(block.timestamp), uint64(block.timestamp + 1 days), 50)), 5, "e"
        );
        registry.register(address(new Guestbook("g2")), 1, "g2");
        vm.stopPrank();

        (uint256 totalLaunches, uint256[5] memory per) = registry.stats();
        assertEq(totalLaunches, 6);
        assertEq(per[0], 2);
        assertEq(per[1], 1);
        assertEq(per[4], 1);
        assertEq(registry.launchesOf(alice).length, 6);
        assertEq(registry.launchesOf(bob).length, 0);
    }

    function test_RejectsFakeContract() public {
        vm.prank(alice);
        FakeOwned fake = new FakeOwned();
        vm.prank(alice);
        vm.expectRevert(LaunchpadRegistry.CodeMismatch.selector);
        registry.register(address(fake), 1, "fake");
    }

    function test_RejectsWrongTemplateId() public {
        address gb = _guestbookBy(alice);
        vm.prank(alice);
        vm.expectRevert(LaunchpadRegistry.CodeMismatch.selector);
        registry.register(gb, 2, "wrong id");
    }

    function test_RejectsUnknownTemplate() public {
        address gb = _guestbookBy(alice);
        vm.startPrank(alice);
        vm.expectRevert(LaunchpadRegistry.UnknownTemplate.selector);
        registry.register(gb, 0, "x");
        vm.expectRevert(LaunchpadRegistry.UnknownTemplate.selector);
        registry.register(gb, 6, "x");
        vm.stopPrank();
    }

    function test_RejectsEOA() public {
        vm.prank(alice);
        vm.expectRevert(LaunchpadRegistry.NotAContract.selector);
        registry.register(bob, 1, "eoa");
    }

    function test_RejectsNonOwner() public {
        address gb = _guestbookBy(alice);
        vm.prank(bob);
        vm.expectRevert(LaunchpadRegistry.NotOwner.selector);
        registry.register(gb, 1, "not mine");
    }

    function test_RejectsDoubleRegistration() public {
        address gb = _guestbookBy(alice);
        vm.startPrank(alice);
        registry.register(gb, 1, "once");
        vm.expectRevert(LaunchpadRegistry.AlreadyRegistered.selector);
        registry.register(gb, 1, "twice");
        vm.stopPrank();
    }

    function test_NameCaps() public {
        address gb = _guestbookBy(alice);
        vm.startPrank(alice);
        vm.expectRevert(LaunchpadRegistry.EmptyName.selector);
        registry.register(gb, 1, "");
        vm.expectRevert(abi.encodeWithSelector(LaunchpadRegistry.NameTooLong.selector, 64));
        registry.register(gb, 1, string(new bytes(65)));
        vm.stopPrank();
    }

    function test_PaginationEdges() public {
        vm.startPrank(alice);
        registry.register(address(new Guestbook("a")), 1, "a");
        registry.register(address(new Guestbook("b")), 1, "b");
        vm.stopPrank();
        assertEq(registry.getLaunches(2, 10).length, 0);
        assertEq(registry.getLaunches(1, type(uint256).max).length, 1);
        assertEq(registry.getLaunches(0, 1)[0].name, "a");
    }
}
