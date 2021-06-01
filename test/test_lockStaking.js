const { expect } = require("chai");
const UniswapV2RouterBuild = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const UniswapV2FactoryBuild = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const WETHBuild = require("@uniswap/v2-periphery/build/WETH9.json");
const c = require('../deploy/Utils/myConstants.js')
const { fromWei, toWei, toTao, fromTao, printTaoBalance, printBalanceToWei,
    mineBlocks, increaseTime, hardhatSnapshot, hardhatRevert } = require("./utils/test_helpers.ts");

describe("LockStaking", function() {
    let deployer, investor1, investor2, investor3, bank, AbortController_;
    let Busd, busd, MockTao, mockTao;
    let uniswapFac, weth, router, UniswapFac, Weth, Router;
    // let Circulation, circulation;
    let UniswapV2FactoryBytecode, UniswapV2FactoryAbi, UniswapV2RouterBytecode, UniswapV2RouterAbi, WETHAbi, WETHBytecode;
    let TaoStakingDistributor, taoStakingDistributor, Staking, staking, Vault, vault;
    let Ptao, ptao,STaoToken,sTaoToken;
    let LockStaking, lockStaking, sLockTaoToken,SLockTaoToken;
    // Uniswap
        UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
        UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
        UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
        UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
        WETHBytecode = WETHBuild.bytecode;
        WETHAbi = WETHBuild.abi;

    beforeEach(async function () {
    	[deployer, owner, investor1, investor2, investor3, bank, AbortController_, dao] = await ethers.getSigners();

    	Busd = await ethers.getContractFactory("MockBUSD");
        MockTao = await ethers.getContractFactory("MockTAO");
        Ptao = await ethers.getContractFactory("PreTaoToken");
        STaoToken = await ethers.getContractFactory("sTaoToken");
        SLockTaoToken = await ethers.getContractFactory("sLockTaoToken");
        UniswapFac = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, deployer);
        Router = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  deployer);
        Weth  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  deployer);


        busd = await Busd.deploy();
        ptao = await Ptao.deploy();
        sTaoToken = await STaoToken.deploy();
        sLockTaoToken = await SLockTaoToken.deploy();
        uniswapFac = await UniswapFac.deploy(deployer.address);
        weth = await Weth.deploy();
        router = await Router.deploy(uniswapFac.address, weth.address);
        tao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);
        TaoStakingDistributor = await ethers.getContractFactory("TaoStakingDistributor");
        Staking = await ethers.getContractFactory("TaoStaking");
        LockStaking =  await ethers.getContractFactory("LockTaoStaking");
        Vault = await ethers.getContractFactory("Vault");



        busd = await Busd.deploy();
        staking = await Staking.deploy();
        lockStaking = await LockStaking.deploy();
        vault = await Vault.deploy();



        taoStakingDistributor = await TaoStakingDistributor.deploy();

        // Transfer money to investors.
        await busd.transfer(investor1.address, toWei('10000'));
        await busd.transfer(investor2.address, toWei('10000'));
        await busd.transfer(investor3.address, toWei('10000'));

        await tao.transfer(investor1.address, toTao('100'));

        await busd.transfer(taoStakingDistributor.address, toWei('100000'));
        await tao.transfer(taoStakingDistributor.address, toTao('20000'));
        await tao.transfer(staking.address, toTao('1000000'));

        //initialize
        await staking.initialize(tao.address,sTaoToken.address,200);
        await lockStaking.initialize(sTaoToken.address,sLockTaoToken.address,200)
        
        await sTaoToken.setMonetaryPolicy(staking.address);
        await sTaoToken.setStakingContract(staking.address);
        await sTaoToken.setLockStakingContract(lockStaking.address);
        await sLockTaoToken.setMonetaryPolicy(lockStaking.address);
        await sLockTaoToken.setStakingContract(lockStaking.address);
        const balance = await taoStakingDistributor.initialize(2, 200, 1, vault.address,
            	staking.address ,tao.address,
             busd.address,dao.address);
    });

    describe("Testing", function () {

        it("Should transfer 10000 to investors", async function () {
            const balance1 = await busd.balanceOf(investor1.address);
            const balance2 = await busd.balanceOf(investor2.address);
            const balance3 = await busd.balanceOf(investor3.address);         
            const tao1 = await tao.balanceOf(investor1.address);
            expect(balance1).to.equal(toWei('10000'))
            expect(balance2).to.equal(toWei('10000'))
            expect(balance3).to.equal(toWei('10000'))
            expect(tao1).to.equal(toTao('100'))
        });
        it("Should be locked", async function () {
        	
            await expect(lockStaking.lockStake())
             .to.be.revertedWith("already locked!");
        });
        it("Should get unloked", async function () {
            await lockStaking.unlockStake();
        });
        it("should be able to stake TAO and unstake TAO", async function (){
             //Investor1 stake 100 TAO and get sTAO
            await tao.connect( investor1 ).approve(staking.address,toTao("100"));      
            await staking.connect( investor1 ).stakeTAO(toTao("100"));

            let staoBalance = await sTaoToken.balanceOf(investor1.address);
            let taoBalance = await tao.balanceOf(investor1.address);
            expect(staoBalance).to.equal(toTao("100"));
            expect(taoBalance).to.equal(toTao("0"));

            await sTaoToken.connect( investor1 ).approve(staking.address,toTao("100"));      
            await staking.connect( investor1 ).unstakeTAO(toTao("100"));

            let staoBalance2 = await sTaoToken.balanceOf(investor1.address);
            let taoBalance2 = await tao.balanceOf(investor1.address);
            expect(staoBalance2).to.equal(toTao("0"));
            expect(taoBalance2).to.equal(toTao("100"));
        })
        it("should be able to stake sTAO in LockStaking contract", async function (){
            //Investor1 stake 100 TAO and get sTAO
            await tao.connect( investor1 ).approve(staking.address,toTao("100"));      
            await staking.connect( investor1 ).stakeTAO(toTao("100"));

            let staoBalance = await sTaoToken.balanceOf(investor1.address);
            let taoBalance = await tao.balanceOf(investor1.address);
            expect(staoBalance).to.equal(toTao("100"));
            expect(taoBalance).to.equal(toTao("0"));

            //Invoster1 try to stake 100 sTAO in locking staking
             await sTaoToken.connect( investor1 ).approve(lockStaking.address,toTao("100"));      
             await lockStaking.connect( investor1 ).stakeTAO(toTao("100"));

             let lockedtokens = await sLockTaoToken.balanceOf(investor1.address);
            expect(lockedtokens).to.equal(toTao("100"));
        })

        it("should not be able to unstake sTAO From LockStaking contract", async function (){
            //Investor1 stake 100 TAO and get sTAO
            await tao.connect( investor1 ).approve(staking.address,toTao("100"));      
            await staking.connect( investor1 ).stakeTAO(toTao("100"));

            let staoBalance = await sTaoToken.balanceOf(investor1.address);
            let taoBalance = await tao.balanceOf(investor1.address);
            expect(staoBalance).to.equal(toTao("100"));
            expect(taoBalance).to.equal(toTao("0"));

            //Invoster1 try to stake 100 sTAO in locking staking
             await sTaoToken.connect( investor1 ).approve(lockStaking.address,toTao("100"));      
             await lockStaking.connect( investor1 ).stakeTAO(toTao("100"));

             let lockedtokens = await sLockTaoToken.balanceOf(investor1.address);
            expect(lockedtokens).to.equal(toTao("100"));

            //Investor1 try to unstake his sTAO tokens
            await expect(lockStaking.connect( investor1 ).unstakeTAO(toTao("100")))
             .to.be.revertedWith("funds are locked");

        })

        it("should be able to unstake sTAO From LockStaking contract", async function (){
            //Investor1 stake 100 TAO and get sTAO
            await tao.connect( investor1 ).approve(staking.address,toTao("100"));      
            await staking.connect( investor1 ).stakeTAO(toTao("100"));

            let staoBalance = await sTaoToken.balanceOf(investor1.address);
            let taoBalance = await tao.balanceOf(investor1.address);
            expect(staoBalance).to.equal(toTao("100"));
            expect(taoBalance).to.equal(toTao("0"));

            //Invoster1 try to stake 100 sTAO in locking staking
             await sTaoToken.connect( investor1 ).approve(lockStaking.address,toTao("100"));      
             await lockStaking.connect( investor1 ).stakeTAO(toTao("100"));

             let lockedtokens = await sLockTaoToken.balanceOf(investor1.address);
            expect(lockedtokens).to.equal(toTao("100"));

            //owner unlock staking
            await lockStaking.unlockStake();
            //Investor1 try to unstake his sTAO tokens
            await sLockTaoToken.connect( investor1 ).approve(lockStaking.address,toTao("100"));     
            await lockStaking.connect( investor1 ).unstakeTAO(toTao("100"));

            let t1 = await sLockTaoToken.balanceOf(investor1.address);
            let t2 = await sTaoToken.balanceOf(investor1.address);
            expect(t1).to.equal(toTao("0"));
            expect(t2).to.equal(toTao("100"));
           

        })

    });


});
