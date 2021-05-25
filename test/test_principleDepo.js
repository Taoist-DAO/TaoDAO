// const { expect } = require("chai");
// const UniswapV2RouterBuild = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
// const UniswapV2FactoryBuild = require("@uniswap/v2-core/build/UniswapV2Factory.json");
// const WETHBuild = require("@uniswap/v2-periphery/build/WETH9.json");
// const c = require('../deploy/Utils/myConstants.js')
// const { fromWei, toWei, toTao, fromTao, printTaoBalance, printBalanceToWei,
//     mineBlocks, increaseTime, hardhatSnapshot, hardhatRevert } = require("./utils/test_helpers.ts");

// describe("TAOPrincipleDepository", function() {
//     let deployer, investor1, investor2, investor3, bank, AbortController_;
//     let Busd, busd, MockTao, mockTao;
//     let uniswapFac, weth, router, UniswapFac, Weth, Router;
//     let Circulation, circulation;
//     let Pdepository, pdepository;
//     let UniswapV2FactoryBytecode, UniswapV2FactoryAbi, UniswapV2RouterBytecode, UniswapV2RouterAbi, WETHAbi, WETHBytecode, pairToken, pairAddress;
//     let TaoRewardDistributor, taoRewardDistributor, Staking, staking, Vault, vault;

//     // Uniswap
//         UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
//         UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
//         UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
//         UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
//         WETHBytecode = WETHBuild.bytecode;
//         WETHAbi = WETHBuild.abi;
//     //test
//     beforeEach(async function () {
//     	[deployer, owner, investor1, investor2, investor3, bank, AbortController_, dao] = await ethers.getSigners();

//     	Busd = await ethers.getContractFactory("MockBUSD");
//         MockTao = await ethers.getContractFactory("MockTAO");
//         Circulation = await ethers.getContractFactory("TAOCirculatingSupplyContract"); 
//         Pdepository = await ethers.getContractFactory("TAOPrincipleDepository"); 
//         UniswapFac = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, deployer);
//         Router = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  deployer);
//         Weth  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  deployer);


//         busd = await Busd.deploy();
//         circulation = await Circulation.deploy(deployer.address);
//         uniswapFac = await UniswapFac.deploy(deployer.address);
//         weth = await Weth.deploy();
//         pdepository = await Pdepository.deploy();
//         router = await Router.deploy(uniswapFac.address, weth.address);
//         tao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);
//         TaoRewardDistributor = await ethers.getContractFactory("TaoStakingDistributor");
//         Staking = await ethers.getContractFactory("TaoStaking");
//         Vault = await ethers.getContractFactory("Vault");
//         staking = await Staking.deploy();
//         vault = await Vault.deploy();
//         taoRewardDistributor = await TaoRewardDistributor.deploy();
//         pairToken = await uniswapFac.createPair(busd.address,tao.address);

//         pairAddress = await uniswapFac.getPair(busd.address,tao.address);
//         // Transfer money to investors.
//         await busd.transfer(investor1.address, toWei('10000'));
//         await busd.transfer(investor2.address, toWei('10000'));
//         await busd.transfer(investor3.address, toWei('10000'));
//         await busd.transfer(taoRewardDistributor.address, toWei('100000'));

//         //initialize
//         await circulation.initialize(tao.address);
//         const balance = await taoRewardDistributor.initialize(2, 200, 300, vault.address,
//             	staking.address ,tao.address,
//              busd.address,dao.address,circulation.address);
//         pdepository.initialize(pairAddress,tao.address,circulation.address);

//     });

//     describe("Test circulation", function () {

//         it("Should transfer 10000 to investors", async function () {
//             const balance1 = await busd.balanceOf(investor1.address);
//             const balance2 = await busd.balanceOf(investor2.address);
//             const balance3 = await busd.balanceOf(investor3.address);
//             expect(balance1).to.equal(toWei('10000'))
//             expect(balance2).to.equal(toWei('10000'))
//             expect(balance3).to.equal(toWei('10000'))
//         });
//         it("calculatePremium", async function () {
//         	let prem = await pdepository.calculatePremium();
//         	console.log("prem: ",prem.toNumber());
//         });
//     });


// });
