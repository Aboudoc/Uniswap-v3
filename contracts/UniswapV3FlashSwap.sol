// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import "./IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "./interfaces/IERC20.sol";
// import "./PoolAddress.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

contract UniswapV3Flash {
    address private constant FACTORY =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;

    address private constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    IERC20 private constant weth = IERC20(WETH);

    uint24 private constant POOL_FEE = 3000;

    struct FlashData {
        uint wethAmount;
        address caller;
    }

    IUniswapV3Pool private immutable pool;

    constructor() {
        PoolAddress.PoolKey memory poolKey = PoolAddress.getPoolKey(
            DAI,
            WETH,
            POOL_FEE
        );
        pool = IUniswapV3Pool(PoolAddress.computeAddress(FACTORY, poolKey));
    }

    function flash(uint wethAmount) external {
        bytes memory data = abi.encode(
            FlashData({wethAmount: wethAmount, caller: msg.sender})
        );

        pool.flash(address(this), 0, wethAmount, data);
    }

    function uniswapV3FlashCallback(
        uint fee0,
        uint fee1,
        bytes calldata data
    ) external {
        require(msg.sender == address(pool), "not authorized");

        FlashData memory decoded = abi.decode(data, (FlashData));

        weth.transferFrom(decoded.caller, address(this), fee1);
        weth.transfer(address(pool), decoded.wethAmount + fee1);
    }
}
