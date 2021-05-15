const { expect } = require("chai");
const { ContractFactory, constants } = require("ethers");
const  UniswapV2RouterBuild  = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const  UniswapV2FactoryBuild  = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const  WETHBuild  = require("@uniswap/v2-periphery/build/WETH9.json");

function toWei(n) {
    return ethers.utils.parseEther(n).toString();
}

function toTao(n) {
    return ethers.utils.parseUnits(n, 9).toString();
}

describe("Principle Depositor", function() {
    let deployer, dao, bonding, vault, tao, busd, staking, calculator, rewardPool, pair

    //constants
        let now = Math.floor(new Date().getTime() / 1000),
        DAOShare = '10', // 10%
        LPShare = '2', // 50%
        bcv = '60',
        vestingPeriod= '300', // 300 blocks, 15min bsc, 65 min eth
        minPremium = '1500'

    beforeEach(async function () {
        [deployer, dao] = await ethers.getSigners();

        // Fetch Contract Factories
        const PrincipleFactory = await ethers.getContractFactory("TAOPrincipleDepository");
        const VaultFactory = await ethers.getContractFactory("Vault");
        const TaoFactory = await ethers.getContractFactory("MockTAO");
        const BusdFactory = await ethers.getContractFactory("MockBUSD");
        const StakingFactory = await ethers.getContractFactory("TaoStaking");
        const CalculatorFactory = await ethers.getContractFactory("TaoBondingCalculator");
        const RewardFactory = await ethers.getContractFactory("RewardPool");
        const PairFactory = await ethers.getContractFactory("MockPair");

        // Uniswap
        const UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
        const UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
        const UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
        const UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
        const WETHBytecode = WETHBuild.bytecode;
        const WETHAbi = WETHBuild.abi;

        // Deploy Contracts
        bonding = await PrincipleFactory.deploy();
        vault = await VaultFactory.deploy();
        tao = await TaoFactory.deploy();
        busd = await BusdFactory.deploy();
        staking = await StakingFactory.deploy();
        calculator = await CalculatorFactory.deploy();
        rewardPool = await RewardFactory.deploy(tao.address);
        pair = await PairFactory.deploy();

      });

    describe("Deployment", function () {
        beforeEach(async function () {
            await bonding.initialize( pair.address, tao.address);
            await bonding.setAddresses(
              calculator.address,
              vault.address,
              rewardPool.address,
              staking.address,
              dao.address,
              DAOShare,
              LPShare
              );
            await bonding.setBondTerms(bcv, vestingPeriod, minPremium);
            await vault.setPrincipleToken(pair.address);
            await vault.setPrincipleDepositor(bonding.address);
        })
        it("bonding should initialize correctly", async function () {
            const log1 = await bonding.callStatic.principleToken();
            console.log(`Principle Token set at: ${log1.toString()}`);

            const log2 = await bonding.callStatic.TAO();
            console.log(`Tao Token set at: ${log2.toString()}`);

            const log3 = await bonding.callStatic.bondControlVariable();
            console.log(`BCV set at ${log3.toString()}`);

            const log4 = await bonding.callStatic.vestingPeriodInBlocks();
            console.log(`vesting period set at ${log4.toString()}`);

            const log5 = await bonding.callStatic.minPremium();
            console.log(`min perium set at ${log5.toString()}`);

            const log6 = await bonding.callStatic.DAOShare();
            console.log(`DAO share set at ${log6.toString()}`);

            const log7 = await bonding.callStatic.LPShare();
            console.log(`LP share set at ${log7.toString()}`);

            expect(log1.toString()).to.equal(pair.address);
            expect(log2.toString()).to.equal(tao.address);
            expect(log3.toString()).to.equal(bcv);
            expect(log4.toString()).to.equal(vestingPeriod);
            expect(log5.toString()).to.equal(minPremium);
            expect(log6.toString()).to.equal(DAOShare);
            expect(log7.toString()).to.equal(LPShare);

        });
        it("Should have bonding as Principle Depositor", async function () {
            const depositor = await vault.callStatic.isPrincipleDepositor(bonding.address)
            expect(depositor).to.equal(true)
        });
        it("Should get corrected quote", async function () {
            const quote = await bonding.callStatic.calculateBondInterest(toWei("1"))
            expect(depositor).to.equal(true)
        });
    });

});
