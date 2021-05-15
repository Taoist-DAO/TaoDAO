// const { expect } = require("chai");
// const { ContractFactory, constants } = require("ethers");
// const  UniswapV2RouterBuild  = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
// const  UniswapV2FactoryBuild  = require("@uniswap/v2-core/build/UniswapV2Factory.json");
// const  WETHBuild  = require("@uniswap/v2-periphery/build/WETH9.json");
// const c = require('../deploy/Utils/myConstants');
// function toWei(n) {
//     return ethers.utils.parseEther(n).toString();
// }

// function toTao(n) {
//     return ethers.utils.parseUnits(n, 9).toString();
// }

// describe("Principle Depositor", function() {
//     let deployer, dao,wethContract, bonding, vault, tao,uniswapFac,weth,router, staking, calculator, rewardPool, pair
//     let Busd,MockTao ,pairAdr, busd,mockTao,routerContract, factoryContract;
//     //constants
//         let now = Math.floor(new Date().getTime() / 1000),
//         DAOShare = '10', // 10%
//         LPShare = '2', // 50%
//         bcv = '60',
//         vestingPeriod= '300', // 300 blocks, 15min bsc, 65 min eth
//         minPremium = '1500'

//     beforeEach(async function () {

//         [deployer, dao, investor1] = await ethers.getSigners();

//         // Uniswap
//         const UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
//         const UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
//         const UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
//         const UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
//         const WETHBytecode = WETHBuild.bytecode;
//         const WETHAbi = WETHBuild.abi;

//         // Fetch Contract Factories
//         const PrincipleFactory = await ethers.getContractFactory("TAOPrincipleDepository");
//         const VaultFactory = await ethers.getContractFactory("Vault");
//         const TaoFactory = await ethers.getContractFactory("SimpleMockTao");
//         const StakingFactory = await ethers.getContractFactory("TaoStaking");
//         const CalculatorFactory = await ethers.getContractFactory("TaoBondingCalculator");
//         const RewardFactory = await ethers.getContractFactory("RewardPool");
//         const CirculatingFactory = await ethers.getContractFactory("TAOCirculatingSupplyContract");
//         factoryContract = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, deployer);
//         routerContract = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  deployer);
//         wethContract  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  deployer);

//         Busd = await ethers.getContractFactory("MockBUSD");
//         MockTao = await ethers.getContractFactory("MockTAO");

//         // Deploy Contracts
//         bonding = await PrincipleFactory.deploy();
//         vault = await VaultFactory.deploy();
//         busd = await Busd.deploy();
//         staking = await StakingFactory.deploy();
//         calculator = await CalculatorFactory.deploy();
//         circulating = await CirculatingFactory.deploy(deployer.address);
//         uniswapFac = await factoryContract.deploy(deployer.address);
//         weth = await wethContract.deploy();
//         router = await routerContract.deploy(uniswapFac.address, weth.address);
//         tao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);
//         rewardPool = await RewardFactory.deploy(tao.address);
//         pairAdr = await uniswapFac.createPair(busd.address, tao.address);
//       });

//     describe("Deployment", function () {
//         beforeEach(async function () {
//         	console.log(`LP Pair Address: ${pairAdr}`)
//         	console.log(tao.address);
//         	console.log(circulating.address);
//             await bonding.initialize( pairAdr, tao.address);
//             console.log("1");
//             await circulating.initialize( tao.address );
//             console.log("1");
//             await bonding.setAddresses(
//               calculator.address,
//               vault.address,
//               rewardPool.address,
//               staking.address,
//               dao.address,
//               DAOShare,
//               LPShare
//               );
//             console.log("1");
//             await bonding.setBondTerms(bcv, vestingPeriod, minPremium);
//             await vault.setPrincipleToken(pairAdr.address);
//             await vault.setPrincipleDepositor(bonding.address);
//             console.log("test")
//         })
//         it("bonding should initialize correctly", async function () {
//             // const log1 = await bonding.callStatic.principleToken();
//             // console.log(`Principle Token set at: ${log1.toString()}`);

//             // const log2 = await bonding.callStatic.TAO();
//             // console.log(`Tao Token set at: ${log2.toString()}`);

//             // const log3 = await bonding.callStatic.bondControlVariable();
//             // console.log(`BCV set at ${log3.toString()}`);

//             // const log4 = await bonding.callStatic.vestingPeriodInBlocks();
//             // console.log(`vesting period set at ${log4.toString()}`);

//             // const log5 = await bonding.callStatic.minPremium();
//             // console.log(`min perium set at ${log5.toString()}`);

//             // const log6 = await bonding.callStatic.DAOShare();
//             // console.log(`DAO share set at ${log6.toString()}`);

//             // const log7 = await bonding.callStatic.LPShare();
//             // console.log(`LP share set at ${log7.toString()}`);

//             // expect(log1.toString()).to.equal(pairAdr);
//             // expect(log2.toString()).to.equal(tao.address);
//             // expect(log3.toString()).to.equal(bcv);
//             // expect(log4.toString()).to.equal(vestingPeriod);
//             // expect(log5.toString()).to.equal(minPremium);
//             // expect(log6.toString()).to.equal(DAOShare);
//             // expect(log7.toString()).to.equal(LPShare);

//         });
//         it("Should have bonding as Principle Depositor", async function () {
//             const depositor = await vault.callStatic.isPrincipleDepositor(bonding.address)
//             expect(depositor).to.equal(true)
//         });
//         it("Should get corrected quote", async function () {
//             const quote = await bonding.calculateBondInterest(toWei("1"))
//             expect(depositor).to.equal(true)
//         });
//     });

// });
