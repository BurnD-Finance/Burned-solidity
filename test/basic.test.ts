import { ethers } from "hardhat";
import {
  Lottery, Lottery__factory,
  Token,
  Token__factory,
} from "../typechain";
import { Signer } from "ethers";
import { expect } from "chai";
import { expectRevert } from "@openzeppelin/test-helpers";
import {formatUnits, isAddress, parseEther} from "ethers/lib/utils";

describe("BurnD", () => {
  let token: Token;
  let lottery: Lottery;
  let accounts: Signer[];
  let deployer: Signer;
  before(async () => {
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    // const router = IUniswapV2Router02Factory;
    // uniswapV2Router02 = await router.connect(uniswapRouter2Address, deployer);

    const tokenFactory = await new Token__factory(deployer);
    token = await tokenFactory.deploy("BurnD", "BURND");

    // The contract is NOT deployed yet; we must wait until it is mined
    await token.deployed();

    // The contract is deployed by Token; Connect to Lottery;

    lottery = Lottery__factory.connect(
      await token.lotteryContract(),
      deployer
    );
  });

  beforeEach(async () => {
    console.log(formatUnits(await token.balanceOf(lottery.address), "ether"));
  })

  async function getAccountEligibility(signer: Signer): Promise<boolean> {
    return await lottery.isEligible(await signer.getAddress());
  }

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
    expect(balanceOf).to.eq("1000000000000000000000000");
  });

  it("should not be eligible to lottery with user1", async () => {
    expect(await getAccountEligibility(accounts[1])).to.be.false;
  });

  it("should transfer 10000 BURND to user1", async () => {
    await token.transfer(
      await accounts[1].getAddress(),
        parseEther("10000")
    );
    expect(
      await token.balanceOf(await accounts[1].getAddress())
    ).to.equal(parseEther('9600'));
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

  it("should transfer 20000 BURND to user2", async () => {
    await token.transfer(
      await accounts[2].getAddress(),
      parseEther( "20000")
    );
    expect(await token.balanceOf(await accounts[2].getAddress())).to.eq(parseEther('19200'));
  });

  it("should return the new balance (999 100 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('999100'));
  });

  it("should be eligible to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.true;
  });

  it("should not be eligible to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.false;
  });

  it("should transfer 30000 BURND to user3", async () => {
    await token.transfer(
      await accounts[3].getAddress(),
      parseEther( "30000")
    );
    expect(await token.balanceOf(await accounts[3].getAddress())).to.eq(parseEther('28800'));

  });

  it("should return the new balance (998 200 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('998200'));
  });

  it("should be eligible to lottery with user3", async () => {
    expect(await getAccountEligibility(accounts[3])).to.be.true;
  });

  it("should not be eligible to lottery with user4", async () => {
    expect(await getAccountEligibility(accounts[4])).to.be.false;
  });

  it("should transfer 40000 BURND to user4", async () => {
    await token.transfer(
      await accounts[4].getAddress(),
      parseEther( "40000")
    );
    expect(await token.balanceOf(await accounts[4].getAddress())).to.eq(parseEther('38400'));
  });

  it("should return the new balance (997 000 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('997000'));
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
      parseEther( "50000")
    );
    expect(await token.balanceOf(await accounts[5].getAddress())).to.eq(parseEther('48000'));
  });

  it("should return the new balance (995 500 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('995500'));
  });

  it("should be eligible to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.true;
  });

  it("should not be eligible to lottery with user6", async () => {
    expect(await getAccountEligibility(accounts[6])).to.be.false;
  });

  it("should transfer 60000 BURND to user6", async () => {
    await token.transfer(
      await accounts[6].getAddress(),
      parseEther( "60000")
    );
    expect(await token.balanceOf(await accounts[6].getAddress())).to.eq(parseEther('57600'));

  });

  it("should return the new balance (993 700 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('993700'));
  });

  it("should be eligible to lottery with user6", async () => {
    expect(await getAccountEligibility(accounts[6])).to.be.true;
  });

  it("should not be eligible to lottery with user7", async () => {
    expect(await getAccountEligibility(accounts[7])).to.be.false;
  });

  it("should transfer 70000 BURND to user7", async () => {
    await token.transfer(
      await accounts[7].getAddress(),
      parseEther( "70000")
    );
    expect(await token.balanceOf(await accounts[7].getAddress())).to.eq(parseEther('67200'));

  });

  it("should return the new balance (991 600 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('991600'));
  });

  it("should be eligible to lottery with user7", async () => {
    expect(await getAccountEligibility(accounts[7])).to.be.true;
  });

  it("should not be eligible to lottery with user8", async () => {
    expect(await getAccountEligibility(accounts[8])).to.be.false;
  });

  it("should transfer 80000 BURND to user8", async () => {
    await token.transfer(
      await accounts[8].getAddress(),
      parseEther( "80000")
    );
    expect(await token.balanceOf(await accounts[8].getAddress())).to.eq(parseEther('76800'));
  });

  it("should return the new balance (989 200 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('989200'));
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
      parseEther( "90000")
    );
    expect(await token.balanceOf(await accounts[9].getAddress())).to.eq(parseEther('86400'));
  });

  it("should return the new balance (986 500 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('986500'));
  });

  it("should be eligible to lottery with user9", async () => {
    expect(await getAccountEligibility(accounts[9])).to.be.true;
  });

  it("should not be eligible to lottery with user10", async () => {
    expect(await getAccountEligibility(accounts[10])).to.be.false;
  });

  it("should transfer 100 000 BURND to user10", async () => {
    await token.transfer(
      await accounts[10].getAddress(),
      parseEther( "100000")
    );
    if((await lottery.getWinners())[0] == await accounts[10].getAddress()){
      expect(await token.balanceOf(await accounts[10].getAddress())).to.eq(parseEther('108000'));
    } else {
      expect(await token.balanceOf(await accounts[10].getAddress())).to.eq(parseEther('96000'));
    }
  });

  it("should return the new balance (983 500 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('983350'));
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
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('92160'));
  });

  it("should lose eligibility to lottery with user10", async () => {
    expect(await getAccountEligibility(accounts[10])).to.be.false;
  });

  it("should return the new balance (980 470 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('980470'));
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
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('138240'));
  });

  it("should lose eligibility to lottery with user5", async () => {
    expect(await getAccountEligibility(accounts[5])).to.be.false;
  });

  it("should return the new balance (979 030 BURND) after tokens has been burnt", async() => {
    expect(await token.totalSupply()).to.equal(parseEther('979030'));
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
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('165888'));
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
    expect(await token.balanceOf(await accounts[11].getAddress())).to.eq(parseEther('184320'));
  });

  it("should lose eligibility to lottery with user2", async () => {
    expect(await getAccountEligibility(accounts[2])).to.be.false;
  });

  it("should return winners", async () => {

    const winners = (await lottery.getWinners());

    expect(isAddress(winners[0])).to.be.true;
    expect(winners.length).to.equal(1);

  });

  // it("Should fail to remove account from Lottery if not called by BurnD Contract", async () => {
  //   await expectRevert(lottery.removeFromLottery(await (accounts[1]).getAddress()), "Only BurnD contract can call this function");
  // });

  // it('should return the address of uniswap Router', async() => {
  //   const uniswapRouter = await token.uniswapV2Router();
  // });
  //
  // it('should return the address of the uniswap PAIR', async() => {
  //   const uniswapV2Pair = await token.uniswapV2Pair();
  //   // expect(web3.utils.isAddress(uniswapV2Pair)).to.be.true;
  //   // expect((web3.eth.getCode(uniswapV2Pair)).toString().length).to.be.at.least(5);
  // });
  //
  // it('should return the total fees', async() => {
  //   console.log((await token.totalFees()).toString())
  // });
  //
  // it('should return the total burn', async() => {
  //   console.log((await token.totalBurn()).toString())
  // });
  //
  // it('should return the Liquidity Pool Balance', async() => {
  //   console.log((await token.LpTokenBalance()).toString())
  // });
  //
  // it('should return if the address is excluded from rewards', async() => {
  //   console.log(await token.isExcludedFromReward(await deployer.getAddress()));
  // });
  //
  // it('should return if the address is excluded from fee', async() => {
  //   console.log(await token.isExcludedFromFee(await deployer.getAddress()));
  // });
  //
  // it('should return the tax fee', async() => {
  //   console.log((await token.getTaxFee('100000')));
  // });
  //
  // it('should return the burn fee', async() => {
  //   console.log((await token.getBurnFee('100000')));
  // });
  //
  // it('should return the liquidity fee', async() => {
  //   console.log((await token.getLiquidityFee('100000')));
  // });
  //
  // it('should return the rate', async() => {
  //   console.log((await token.getRate()).toString());
  // });
  //
  // it('should return the reflectionFromToken with transferFee', async() => {
  //   console.log((await token.reflectionFromToken('100000', false)).toString());
  // });
  //
  // it('should return the reflectionFromToken without transferFee', async() => {
  //   console.log((await token.reflectionFromToken('100000', false)).toString());
  // });
  //
  // it('should return the tokenFromReflection', async() => {
  //   console.log((await token.tokenFromReflection('100000')));
  // });
  //
  // it('should return the current Supply', async() => {
  //   console.log((await token.getCurrentSupply()).toString());
  // });
  //
  // it('should return the Values', async() => {
  //   console.log((await token.getValues(1000)).toString());
  // });
  //
  // it('should return the TValues', async() => {
  //   console.log((await token.getTValues(1000)).toString());
  // });
});
