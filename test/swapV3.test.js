const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("UniswapV3", function () {
  describe("Uniswap V3 Single Hop Swap", function () {
    it("swapExactInputSingle", async function () {
      const accounts = await ethers.getSigners();
      const UniswapV3SingleHopSwap = await ethers.getContractFactory(
        "UniswapV3SingleHopSwap"
      );
      const uniswapV3SingleHopSwap = await UniswapV3SingleHopSwap.deploy();
      await uniswapV3SingleHopSwap.deployed();

      // expect(await lock.unlockTime()).to.equal(unlockTime);
    });
  });

  describe("UniswapV3MultiHopSwap", function () {
    it("", async function () {});
  });
});
