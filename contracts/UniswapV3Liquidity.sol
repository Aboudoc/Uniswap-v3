// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

import "./interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "hardhat/console.sol";

contract UniswapV3Liquidity is IERC721Receiver {
    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    IERC20 private constant dai = IERC20(DAI);
    IERC20 private constant weth = IERC20(WETH);

    int24 private constant MIN_TICK = -887272;
    int24 private constant MAX_TICK = -MIN_TICK;
    int24 private constant TICK_SPACING = 60;

    uint256 public tokenId;

    INonfungiblePositionManager public manager =
        INonfungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);

    event Mint(uint _tokenId);

    function onERC721Received(
        address operator,
        address from,
        uint _tokenId,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function mint(uint amount0ToAdd, uint amount1ToAdd) external {
        dai.transferFrom(msg.sender, address(this), amount0ToAdd);
        weth.transferFrom(msg.sender, address(this), amount1ToAdd);

        dai.approve(address(manager), amount0ToAdd);
        weth.approve(address(manager), amount1ToAdd);

        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: DAI,
                token1: WETH,
                fee: 3000,
                tickLower: (MIN_TICK / TICK_SPACING) * TICK_SPACING,
                tickUpper: (MAX_TICK / TICK_SPACING) * TICK_SPACING,
                amount0Desired: amount0ToAdd,
                amount1Desired: amount1ToAdd,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });

        (uint _tokenId, uint128 liquidity, uint amount0, uint amount1) = manager
            .mint(params);

        // console.log("Token id", _tokenId);

        tokenId = _tokenId;

        if (amount0ToAdd > amount0) {
            dai.approve(address(manager), 0);
            dai.transfer(msg.sender, amount0ToAdd - amount0);
        }
        if (amount1ToAdd > amount1) {
            weth.approve(address(manager), 0);
            weth.transfer(msg.sender, amount1ToAdd - amount1);
        }

        console.log("Token id", tokenId);
        console.log("Liquidity", liquidity);

        emit Mint(_tokenId);
    }

    // Use tokenId state variable
    function increaseLiquidity(uint amount0ToAdd, uint amount1ToAdd) external {
        dai.transferFrom(msg.sender, address(this), amount0ToAdd);
        weth.transferFrom(msg.sender, address(this), amount1ToAdd);

        dai.approve(address(manager), amount0ToAdd);
        weth.approve(address(manager), amount1ToAdd);

        INonfungiblePositionManager.IncreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .IncreaseLiquidityParams({
                    tokenId: tokenId,
                    amount0Desired: amount0ToAdd,
                    amount1Desired: amount1ToAdd,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        (uint liquidity, uint amount0, uint amount1) = manager
            .increaseLiquidity(params);

        console.log("Liquidity is:", liquidity);
        console.log("amount 0 is:", amount0);
        console.log("amount 1 is:", amount1);

        if (amount0ToAdd > amount0) {
            dai.approve(address(manager), 0);
            dai.transfer(msg.sender, amount0ToAdd - amount0);
        }

        if (amount1ToAdd > amount1) {
            weth.approve(address(manager), 0);
            weth.transfer(msg.sender, amount1ToAdd - amount1);
        }
    }

    function decreaseLiquidity(uint128 liquidity) external {
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: liquidity,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        (uint amount0, uint amount1) = manager.decreaseLiquidity(params);

        console.log("amount 0:", amount0);
        console.log("amount 1:", amount1);
    }

    function collect() external {
        INonfungiblePositionManager.CollectParams
            memory params = INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: msg.sender,
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint amount0, uint amount1) = manager.collect(params);

        console.log("fee 0:", amount0);
        console.log("fee 1:", amount1);
    }

    function getLiquidity(uint _tokenId) external view returns (uint128) {
        (, , , , , , , uint128 liquidity, , , , ) = manager.positions(_tokenId);
        return liquidity;
    }
}
