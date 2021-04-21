import { ethers } from "hardhat";
import {
  IUniswapV2Router02,
  IUniswapV2Router02__factory,
  Lottery, Lottery__factory,
  Token,
  Token__factory,
} from "../typechain";
import { Signer } from "ethers";
import { expect } from "chai";
import {expectRevert, time} from "@openzeppelin/test-helpers";
import {formatUnits, isAddress, parseEther} from "ethers/lib/utils";

describe("BurnD", () => {
  let token: Token;
  let lottery: Lottery;
  let uniswapV2Router02: IUniswapV2Router02;
  let accounts: Signer[];
  let deployer: Signer;
  let deployerAddress: string;
  before(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    deployerAddress = await accounts[0].getAddress();

    // const router = IUniswapV2Router02Factory;
    // uniswapV2Router02 = await router.connect(uniswapRouter2Address, deployer);

    const tokenFactory = await new Token__factory(deployer);
    token = await tokenFactory.deploy("BurnD", "BURND");

    // The contract is NOT deployed yet; we must wait until it is mined
    await token.deployed();

    // The contract is deployed by Token; Connect to Lottery
    lottery = Lottery__factory.connect(
      await token.lotteryContract(),
      deployer
    );

    const router = IUniswapV2Router02__factory;
    uniswapV2Router02 = await router.connect(await token.uniswapV2Router(), deployer);

  });

  beforeEach(async () => {
    console.log('LotteryBalance',formatUnits(await token.balanceOf(lottery.address), "ether"));
    console.log('LPTokenBalance', ((await token.LpTokenBalance())).toString());
    console.log('uniswapPairBalance', ((await token.uniswapPairBalance())).toString());
    console.log('uniswapRouterBalance', ((await token.uniswapRouterBalance())).toString());
    console.log('ContractBURNDBalance', formatUnits(await token.balanceOf(token.address), "ether"));
    console.log('ContractETHBalance', formatUnits( await ethers.provider.getBalance(token.address), "ether"));
    console.log('minimumBeforeAddingLiquidity', formatUnits(await token.minimumBeforeAddingLiquidity(), "ether"));
  })

  async function getAccountEligibility(signer: Signer): Promise<boolean> {
    return await lottery.isEligible(await signer.getAddress());
  }

  it("should add Liquidity", async() => {
    await token.approve(uniswapV2Router02.address, parseEther('700000'));

    await uniswapV2Router02.addLiquidityETH(
        token.address,
        parseEther('700000'),
        parseEther('0'),
        parseEther('50'),
        deployerAddress,
        await time.latest() + time.duration.hours(1),
        {value: parseEther('50')})
  })

  it("Should fail to add account to Lottery if not called by BurnD Contract", async () => {
    await expectRevert(
      lottery.addToLottery(await accounts[1].getAddress()),
      "Only BurnD contract can call this function"
    );
  });

  it("Should fail to remove account from Lottery if not called by BurnD Contract", async () => {
    await expectRevert(
        lottery.removeFromLottery(await accounts[1].getAddress()),
        "Only BurnD contract can call this function"
    );
  });

  it("should return the name", async () => {
    const name = await token.name();
    expect(name).to.equal("BurnD");
  });

  it("should return the symbol", async () => {
    const symbol = await token.symbol();
    expect(symbol).to.equal("BURND");
  });

  it("should return the decimals", async () => {
    const decimals = await token.decimals();
    expect(decimals).to.eq(18);
  });

  it("should return the totalSupply", async () => {
    const totalSupply = await token.totalSupply();
    expect(totalSupply).to.eq("1000000000000000000000000");
  });

  it("should return the balance of the deployer", async () => {
    const balanceOf = await token.balanceOf(await deployer.getAddress());
    expect(balanceOf).to.eq("300000000000000000000000");
  });

  it("should not be eligible to lottery with user1", async () => {
    expect(await getAccountEligibility(accounts[1])).to.be.false;
  });

  it("should transfer 10000 BURND to user1", async () => {
    await token.transfer(
      await accounts[1].getAddress(),
        parseEther("10000")
    );
    console.log('FEE calculated with', formatUnits((await token._calculatePercentageOfAmount(await token.burnFee(), parseEther("10000"))).toString()), "ether");
    expect(
      await token.balanceOf(await accounts[1].getAddress())
    ).to.equal(parseEther('9000'));
  });

  it("should return the new balance (999 700 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999700'));
  });

  it("should be eligible to lottery with user1", async () => {
    expect(await getAccountEligibility(accounts[1])).to.be.true;
  })

  it("should not be eligible to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.false;
  })

  it("should transfer 2000 BURND to user2", async () => {
    await token.transfer(
      await accounts[2].getAddress(),
      parseEther( "2000")
    );
    expect(await token.balanceOf(await accounts[2].getAddress())).to.eq(parseEther('1800'));
  });

  it("should return the new balance (999 640 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999640'));
  });

  it("should be eligible to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.true;
  });

  it("should not be eligible to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.false;
  });

  it("should transfer 3000 BURND to user3", async () => {
    await token.transfer(
      await accounts[3].getAddress(),
      parseEther( "3000")
    );
    expect(await token.balanceOf(await accounts[3].getAddress())).to.eq(parseEther('2700'));

  });

  it("should return the new balance (999 550 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999550'));
  });

  it("should be eligible to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.true;
  });

  it("should not be eligible to lottery with user4", async () => {
    expect(await getAccountEligibility(accounts[4])).to.be.false;
  });

  it("should transfer 4000 BURND to user4", async () => {
    await token.transfer(
      await accounts[4].getAddress(),
      parseEther( "4000")
    );
    expect(await token.balanceOf(await accounts[4].getAddress())).to.eq(parseEther('3600'));
  });

  it("should return the new balance (999 430 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999430'));
  });

  it("should be eligible to lottery with user4", async () => {
    expect(await getAccountEligibility(accounts[4])).to.be.true;
  });

  it("should not be eligible to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.false;
  });

  it("should transfer to user5", async () => {
    await token.transfer(
      await accounts[5].getAddress(),
      parseEther( "5000")
    );
    expect(await token.balanceOf(await accounts[5].getAddress())).to.eq(parseEther('4500'));
  });

  it("should return the new balance (999 280 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999280'));
  });

  it("should be eligible to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.true;
  });

  it("should not be eligible to lottery with user6", async () => {
    expect(await getAccountEligibility(accounts[6])).to.be.false;
  });

  it("should transfer 6000 BURND to user6", async () => {
    await token.transfer(
      await accounts[6].getAddress(),
      parseEther( "6000")
    );
    expect(await token.balanceOf(await accounts[6].getAddress())).to.eq(parseEther('5400'));

  });

  it("should return the new balance (999 100 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999100'));
  });

  it("should be eligible to lottery with user6", async () => {
    expect(await getAccountEligibility(accounts[6])).to.be.true;
  });

  it("should not be eligible to lottery with user7", async () => {
    expect(await getAccountEligibility(accounts[7])).to.be.false;
  });

  it("should transfer 7000 BURND to user7", async () => {
    await token.transfer(
      await accounts[7].getAddress(),
      parseEther( "7000")
    );
    expect(await token.balanceOf(await accounts[7].getAddress())).to.eq(parseEther('6300'));

  });

  it("should return the new balance (998 890 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('998890'));
  });

  it("should be eligible to lottery with user7", async () => {
    expect(await getAccountEligibility(accounts[7])).to.be.true;
  });

  it("should not be eligible to lottery with user8", async () => {
    expect(await getAccountEligibility(accounts[8])).to.be.false;
  });

  it("should transfer 8000 BURND to user8", async () => {
    await token.transfer(
      await accounts[8].getAddress(),
      parseEther( "8000")
    );
    expect(await token.balanceOf(await accounts[8].getAddress())).to.eq(parseEther('7200'));
  });

  it("should return the new balance (998 650 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('998650'));
  });

  it("should be eligible to lottery with user8", async () => {
    expect(await getAccountEligibility(accounts[8])).to.be.true;
  });

  it("should not be eligible to lottery with user9", async () => {
    expect(await getAccountEligibility(accounts[9])).to.be.false;
  });

  it("should transfer 90000 BURND to user9", async () => {
    await token.transfer(
      await accounts[9].getAddress(),
      parseEther( "9000")
    );
    expect(await token.balanceOf(await accounts[9].getAddress())).to.eq(parseEther('8100'));
  });

  it("should return the new balance (998 380 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('998380'));
  });

  it("should be eligible to lottery with user9", async () => {
    expect(await getAccountEligibility(accounts[9])).to.be.true;
  });

  it("should not be eligible to lottery with user10", async () => {
    expect(await getAccountEligibility(accounts[10])).to.be.false;
  });

  it("should transfer 10000 BURND to user10", async () => {
    await token.transfer(
      await accounts[10].getAddress(),
      parseEther( "10000")
    );
    if((await lottery.getWinners())[0] == await accounts[10].getAddress()){
      expect(await token.balanceOf(await accounts[10].getAddress())).to.eq(parseEther('9450'));
    } else {
      expect(await token.balanceOf(await accounts[10].getAddress())).to.eq(parseEther('9000'));
    }
  });

  it("should return the new balance (998 080 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('998080'));
  });

  it("should be eligible to lottery with user10", async () => {
    expect(await getAccountEligibility(accounts[10])).to.be.true;
  });

  it("should transfer from user10 to user11", async () => {
    await token
      .connect(accounts[10])
      .transfer(
        await accounts[11].getAddress(),
        await token.balanceOf(await accounts[10].getAddress())
      );

    expect(await token.balanceOf(await accounts[10].getAddress())).to.eq(parseEther('0'));
    if((await lottery.getWinners())[0] == await accounts[10].getAddress()) {
      expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('8505'));
    } else {
      expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('8100'));
    }
  });

  it("should lose eligibility to lottery with user10", async () => {
    expect(await getAccountEligibility(accounts[10])).to.be.false;
  });

  it("should return the new balance (980 650 BURND) after tokens has been burnt", async() => {
    if((await lottery.getWinners())[0] == await accounts[10].getAddress()) {
      expect(await token.totalSupply()).to.equal(parseEther('980515'));
    } else {
      expect(await token.totalSupply()).to.equal(parseEther('997810'));
    }
  });

  it("should be eligibility to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.true;
  });

  it("should transfer from user5 to user11", async () => {
    await token
      .connect(accounts[5])
      .transfer(
        await accounts[11].getAddress(),
        await token.balanceOf(await accounts[5].getAddress())
      );
    expect(await token.balanceOf(await accounts[5].getAddress())).to.eq(parseEther('0'));
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('12150'));
  });

  it("should lose eligibility to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.false;
  });

  it("should return the new balance (997 675 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('997675'));
  });

  it("should be eligible to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.true;
  });

  it("should transfer from user3 to user11", async () => {
    await token
      .connect(accounts[3])
      .transfer(
        await accounts[11].getAddress(),
        await token.balanceOf(await accounts[3].getAddress())
      );
    expect(await token.balanceOf(await accounts[3].getAddress())).to.eq(parseEther('0'));
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('14580'));
  });

  it("should lose eligibility to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.false;
  });

  it("should be eligible to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.true;
  });

  it("should transfer from user2 to user11", async () => {
    await token
      .connect(accounts[2])
      .transfer(
        await accounts[11].getAddress(),
        await token.balanceOf(await accounts[2].getAddress())
      );
    expect(await token.balanceOf(await accounts[2].getAddress())).to.eq(parseEther('0'));
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('16200'));
  });

  it("should lose eligibility to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.false;
  });

  it("should return winners", async () => {
    const winners = (await lottery.getWinners());
    expect(isAddress(winners[0])).to.be.true;
    expect(winners.length).to.equal(1);
  });

  it("Should set Liquidity Fees to 3%", async() => {
    await token.setLiquidityFee(3);
    console.log((await token.liquidityFee()).toString());
    console.log((await token.liquidityFee()).toString());
  });

});
