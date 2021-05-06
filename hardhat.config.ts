// hardhat.config.ts

require('dotenv').config();
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-web3"
import "hardhat-deploy"
import "@nomiclabs/hardhat-etherscan"

import { HardhatUserConfig } from "hardhat/types"

const accounts = {
  mnemonic: process.env.testMNEMONIC || "test test test test test test test test test test test junk",
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY,
  },
  mocha: {
    timeout: 20000,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      //97: 1,
    },
    dev: {
      default: 1,
      97: 2,
    },
    teamFund: {
      default: 3,
      // Bsc Mainnet
      56: '0x3b5a7663A11391ABa28a04D38Fa3d82f7BA728eB',
      // Bsc Testnet
      97: '0xD98C22Bbd1966D47B6a6ae8F6aB3150CeeA81167'
    },
    DAO: {
      default: 3,
      // Bsc Mainnet
      56: '0x7f0E9dc5aFdD761E865C588d9Fce35d9c6338b08',
      // Bsc Testnet
      97: '0xD98C22Bbd1966D47B6a6ae8F6aB3150CeeA81167'
    }
  },
  networks: {
  //   hardhat: {
  //     forking: {
  //       url: "https://bsc-dataseed.binance.org/",
  //       blockNumber: 7089532
  //     }
  //   }
  // },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      accounts,
      chainId: 56,
      live: true,
      saveDeployments: true,
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-2-s1.binance.org:8545",
      accounts,
      chainId: 97,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 2,
    },

    bsctestnet2: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts,
      chainId: 97,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 2,
    },
  },
  paths: {
    artifacts: "artifacts",
    cache: "cache",
    deploy: "deploy",
    deployments: "deployments",
    imports: "imports",
    sources: "contracts",
    tests: "test",
  },
  solidity: {
    compilers: [
      {
        version: "0.7.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.5",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
}

export default config

