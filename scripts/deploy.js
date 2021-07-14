import pkg from 'hardhat';
const { ethers, upgrades } = pkg;

async function main() {

  const tokenFactory = await ethers.getContractFactory("UToken");

  const token = await upgrades.deployProxy(tokenFactory, [], { initializer: 'initialize' });

  await token.deployed();

  // The address the Contract WILL have once mined
  console.log("Token: " + token.address);

  // The transaction that was sent to the network to deploy the Contract
  console.log("- Transaction: " + token.deployTransaction.hash);

  // The contract is NOT deployed yet; we must wait until it is mined
  await token.deployed();

  console.log("Ready.")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
