import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { HardhatUserConfig } from "hardhat/types";

import { task } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";

require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');

//import ethers from 'hardhat';

// TODO: reenable solidity-coverage when it works
// import "solidity-coverage";

const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';

const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET || '';

const PRIVATE_KEY_RINKEBY =
  process.env.PRIVATE_KEY_RINKEBY! ||
  "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3"; // well known private key


task("accounts", "Prints the list of accounts", async (args, hre) => {

  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

task("mint", "Mint Tokens")
  .addParam("contract", "The contract's address")
  .addParam("to", "The beneficiary's address")
  .addParam("amount", "The amount to mint")
  .setAction( async (args, hre) => {
  

  const {utils, BigNumber} = hre.ethers
    
  const abi = [
    "function mint(address to, uint256 amount) public",
    "function decimals() public view returns (uint8)",
  ]

  

  const {contract: address, test, to: beneficiary, amount} = args

  const contract = await hre.ethers.getContractAt(abi, address)
  const accounts = await hre.ethers.getSigners();

  console.log("Contract: " + contract.address)
  console.log("Signer: " + accounts[0].address)
  console.log("To: " + beneficiary)
  console.log("Amount: " + amount)

  const amountWei = utils.parseEther(amount)
  
  const decimals = await contract.decimals()
  console.log("Decimals: " + decimals)
  console.log("Amount Wei: " + amountWei)
  
  const signer = contract.connect(accounts[0])

  const tx = await signer.mint(beneficiary, amountWei)
  console.log(tx);
  
  console.log(await tx.wait())
  //console.log(2, ethers)
  return
  //const tokenFactory = await ethers.getContractFactory("UCToken");

  //console.log(tokenFactory)
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.2", settings: {} }],
    settings: {
      optimizer: {
        enabled: true
      }
     }    
  },
  networks: {
    hardhat: {},
    localhost: {},
    /*mainnet: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY_MAINNET],
    },*/
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY_RINKEBY],
    },

    binance_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY_RINKEBY],
    },
    binance_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY_RINKEBY],
    },

    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
    //apiKey: BSCSCAN_API_KEY,
  },
};

export default config;
