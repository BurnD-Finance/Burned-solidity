import { ethers } from "hardhat";

import { Token, Token__factory } from "../typechain";

async function main() {
  const signers = await ethers.getSigners();

  const factory = await new Token__factory(signers[0]);
  // await ethers.getContract("TestTeslaMoonShot");
  // If we had constructor arguments, they would be passed into deploy()
  const contract: Token = await factory.deploy("BurnD", "BURND");
  // The address the Contract WILL have once mined
  console.log(contract.address);
  // The transaction that was sent to the network to deploy the Contract
  console.log(contract.deployTransaction.hash);
  // The contract is NOT deployed yet; we must wait until it is mined
  await contract.deployed();
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
