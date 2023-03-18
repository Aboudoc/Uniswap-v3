const { ethers } = require("hardhat");
const { expect } = require("chai");

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("UniswapV3", function () {
  describe("Uniswap V3 Single Hop Swap", function () {
    let accounts, dai, weth, uniswapV3SingleHopSwap;

    beforeEach(async function () {
      accounts = await ethers.getSigners();
      dai = await ethers.getContractAt("IERC20", DAI);
      weth = await ethers.getContractAt("IWETH", WETH);
      const UniswapV3SingleHopSwap = await ethers.getContractFactory(
        "UniswapV3SingleHopSwap"
      );
      uniswapV3SingleHopSwap = await UniswapV3SingleHopSwap.deploy();
      await uniswapV3SingleHopSwap.deployed();
    });

    it("swapExactInputSingle", async function () {
      const amountIn = 10n ** 18n;

      await weth.deposit({ value: amountIn });
      await weth.approve(uniswapV3SingleHopSwap.address, amountIn);

      await uniswapV3SingleHopSwap.swapExactInputSingleHop(amountIn, 1);

      console.log("DAI balance", await dai.balanceOf(accounts[0].address));

      // expect(await lock.unlockTime()).to.equal(unlockTime);
    });
  });

  describe("UniswapV3MultiHopSwap", function () {
    it("", async function () {});
  });
});
