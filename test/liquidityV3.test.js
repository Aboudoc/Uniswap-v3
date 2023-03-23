const { expect } = require("chai");
const { ethers, network } = require("hardhat");
require("dotenv").config();

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const DAI_WHALE = "0xc08a8a9f809107c5A7Be6d90e315e4012c99F39a";
// const USDC_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const USDC_WHALE = "0xc08a8a9f809107c5A7Be6d90e315e4012c99F39a";
//

describe("Liquidity on Uniswap v3", () => {
  let liquidityExamples;
  let accounts;
  let dai;
  let usdc;
  let weth;

  before(async () => {
    accounts = await ethers.getSigners(1);

    const LiquidityExamples = await ethers.getContractFactory(
      "UniswapV3Liquidity"
    );
    liquidityExamples = await LiquidityExamples.deploy();
    await liquidityExamples.deployed();

    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);
    weth = await ethers.getContractAt("IWETH", WETH);

    let daiBalance = await dai.balanceOf(accounts[0].address);
    let wethBalance = await weth.balanceOf(accounts[0].address);

    console.log(
      "----------------------------------------------------------------"
    );

    console.log(`DAI  balance: ${daiBalance}`);
    console.log(`WETH  balance: ${wethBalance}`);

    // Unlock DAI and USDC whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [process.env.DAI_WHALE],
    });
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [process.env.USDC_WHALE],
    });
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [process.env.WETH_WHALE],
    });

    const daiWhale = await ethers.getSigner(process.env.DAI_WHALE);
    const usdcWhale = await ethers.getSigner(process.env.USDC_WHALE);
    const wethWhale = await ethers.getSigner(process.env.WETH_WHALE);

    const daiWhalebalance = await dai.balanceOf(daiWhale.address);
    const usdcWhaleBalance = await usdc.balanceOf(usdcWhale.address);
    const wethWhaleBalance = await weth.balanceOf(wethWhale.address);

    console.log(`DAI whale balance: ${daiWhalebalance}`);
    // console.log(`USDC whale balance: ${usdcWhaleBalance}`);
    console.log(`WETH whale balance: ${wethWhaleBalance}`);

    // Send DAI and WETH to accounts[0]
    const wethAmount = 50n * 10n ** 18n;
    const daiAmount = 8000n * 10n ** 18n;
    // const usdcAmount = 1000n * 10n ** 6n;

    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount);
    await weth.connect(wethWhale).transfer(accounts[0].address, wethAmount);

    daiBalance = await dai.balanceOf(accounts[0].address);
    wethBalance = await weth.balanceOf(accounts[0].address);

    console.log(`DAI  balance AFTER: ${daiBalance}`);
    console.log(`WETH  balance AFTER: ${wethBalance}`);
  });

  it("mintNewPosition", async () => {
    const daiAmount = 8000n * 10n ** 18n;
    const wethAmount = 10n ** 18n;
    // const usdcAmount = 100n * 10n ** 6n;

    await dai
      .connect(accounts[0])
      .approve(liquidityExamples.address, daiAmount);
    await weth
      .connect(accounts[0])
      .approve(liquidityExamples.address, wethAmount);

    console.log(
      "-----------------------------Mint-------------------------------"
    );

    await liquidityExamples.mint(daiAmount, wethAmount);

    console.log(
      "----------------------Balance after Mint------------------------"
    );

    console.log("DAI balance after", await dai.balanceOf(accounts[0].address));
    console.log(
      "WETH balance after",
      await weth.balanceOf(accounts[0].address)
    );
  });

  it.skip("increaseLiquidityCurrentRange", async () => {
    const daiAmount = 5000n * 10n ** 18n;
    const wethAmount = 10n * 10n ** 18n;

    await dai
      .connect(accounts[0])
      .approve(liquidityExamples.address, daiAmount);
    await weth
      .connect(accounts[0])
      .approve(liquidityExamples.address, wethAmount);

    await dai
      .connect(accounts[0])
      .approve(liquidityExamples.address, daiAmount);
    await weth
      .connect(accounts[0])
      .approve(liquidityExamples.address, wethAmount);

    console.log(
      "----------------------Increase Liquidity------------------------"
    );

    await liquidityExamples.increaseLiquidity(daiAmount, wethAmount);
    //////////// we already logged amount0, amount1 and liquidity from the contract////////////
  });

  it("decreaseLiquidity", async () => {
    console.log("Before decreasing liquidity =>");

    console.log(`dai: ${await dai.balanceOf(accounts[0].address)}`);
    console.log(`weth: ${await weth.balanceOf(accounts[0].address)}`);

    const tokenId = await liquidityExamples.tokenId();
    const liquidity = await liquidityExamples.getLiquidity(tokenId);

    await liquidityExamples.decreaseLiquidity(liquidity);

    console.log(
      "----------------------decrease liquidity----------------------"
    );
    console.log(`liquidity: ${liquidity}`);
    console.log(`dai: ${await dai.balanceOf(accounts[0].address)}`);
    console.log(`weth: ${await weth.balanceOf(accounts[0].address)}`);
  });

  it("collectAllFees", async () => {
    console.log(
      "--------------------------Collect fees--------------------------"
    );
    const tokenId = await liquidityExamples.tokenId();
    console.log(`token id: ${tokenId}`);

    await liquidityExamples.collect();
    //////////// we already logged the fees from the contract////////////
    // console.log(`dai ${await dai.balanceOf(accounts[0].address)}`);
    // console.log(`weth ${await weth.balanceOf(accounts[0].address)}`);
  });
});
