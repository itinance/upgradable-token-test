import { ethers } from "hardhat";
const { upgrades } = require("hardhat");

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { UToken__factory, UToken } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(chaiAsPromised);
const { expect } = chai;


describe("Token", () => {
  let token: UToken,
    axel: SignerWithAddress,
    ben: SignerWithAddress,
    chantal: SignerWithAddress
    ;


  beforeEach(async () => {
    [axel, ben, chantal] = await ethers.getSigners();

    const tokenFactory = (await ethers.getContractFactory("UToken", chantal)) as UToken__factory;

    token = await upgrades.deployProxy(tokenFactory, [], { initializer: 'initialize' });
  
    await token.deployed();

    const initialTotalSupply = await token.totalSupply();

    // 3
    expect(initialTotalSupply).to.eq(0);
    expect(token.address).to.properAddress;
  });

  // 4
  describe("we can mint tokens", async () => {

    it("should mint tokens to Axel successfully", async () => {
      const totalSupplyBefore = await token.totalSupply();

      const balanceBefore = await token.balanceOf(axel.address);
      expect(balanceBefore).to.eq(0);

      await token.mint(axel.address, 1001);

      const balance = await token.balanceOf(axel.address)
      expect(balance).to.eq(1001);

      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.eq(totalSupplyBefore.add(1001));
    });

    describe("we can mint even more tokens", async () => {

      beforeEach(async () => {
        // initial supply to Axel
        await token.mint(axel.address, 1001);
      })

      it("should mint tokens to Ben successfully as well", async () => {
        const totalSupplyBefore = await token.totalSupply();
        expect(totalSupplyBefore).to.eq(1001);

        const balanceBefore = await token.balanceOf(ben.address);
        expect(balanceBefore).to.eq(0);

        await token.mint(ben.address, 505);

        const balance = await token.balanceOf(ben.address)
        expect(balance).to.eq(505);

        const totalSupply = await token.totalSupply();
        expect(totalSupply).to.eq(1506);

        const balanceAxel = await token.balanceOf(axel.address)
        expect(balanceAxel).to.eq(1001);
      });

    });
  });

  describe("token transfer should work", async () => {

    it("mint and transfer should work properly", async () => {
      expect(await token.totalSupply()).to.eq(0);

      await token.mint(axel.address, 1001);
      expect(await token.totalSupply()).to.eq(1001);

      expect(await token.balanceOf(axel.address)).to.eq(1001);

      await token.connect(axel).transfer(ben.address, 600);
      await token.connect(axel).transfer(chantal.address, 400);

      expect(await token.balanceOf(axel.address)).to.eq(1);
      expect(await token.balanceOf(ben.address)).to.eq(600);
      expect(await token.balanceOf(chantal.address)).to.eq(400);
    });

  });

  describe("pause and unpause", async () => {

    it("transfer should be stopped after pause", async () => {
      await token.mint(axel.address, 1001);
      await token.pause();

      expect(await token.totalSupply()).to.eq(1001);

      expect(await token.balanceOf(axel.address)).to.eq(1001);

      await expect(token.connect(axel).transfer(ben.address, 600)).to.be.revertedWith('token transfer while paused');

      expect(await token.balanceOf(axel.address)).to.eq(1001);
      expect(await token.balanceOf(ben.address)).to.eq(0);
      expect(await token.balanceOf(chantal.address)).to.eq(0);

      await token.unpause();

      await token.connect(axel).transfer(ben.address, 600);

      expect(await token.balanceOf(axel.address)).to.eq(401);
      expect(await token.balanceOf(ben.address)).to.eq(600);
    });

  });

});


