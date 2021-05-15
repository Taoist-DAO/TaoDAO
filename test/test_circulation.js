const { expect } = require("chai");
const UniswapV2RouterBuild = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const UniswapV2FactoryBuild = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const WETHBuild = require("@uniswap/v2-periphery/build/WETH9.json");
const c = require('../deploy/Utils/myConstants.js')
const { fromWei, toWei, toTao, fromTao, printTaoBalance, printBalanceToWei,
    mineBlocks, increaseTime, hardhatSnapshot, hardhatRevert } = require("./utils/test_helpers.ts");

describe("CirculationSupply", function() {
    let deployer, investor1, investor2;
    let Busd, busd, MockTao, mockTao;
    let uniswapFac, weth, router, UniswapFac, Weth, Router;
    let Circulation, circulation;
    let UniswapV2FactoryBytecode, UniswapV2FactoryAbi, UniswapV2RouterBytecode, UniswapV2RouterAbi, WETHAbi, WETHBytecode;

    // Uniswap
        UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
        UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
        UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
        UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
        WETHBytecode = WETHBuild.bytecode;
        WETHAbi = WETHBuild.abi;

    beforeEach(async function () {
        [owner, deployer, investor1, investor2, accountWithTao] = await ethers.getSigners();

        Busd = await ethers.getContractFactory("MockBUSD");
        MockTao = await ethers.getContractFactory("MockTAO");
        Circulation = await ethers.getContractFactory("TAOCirculatingSupplyContract"); 
        UniswapFac = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, deployer);
        Router = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  deployer);
        Weth  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  deployer);
        
        
        busd = await Busd.deploy();
        circulation = await Circulation.deploy(owner.address);
        uniswapFac = await UniswapFac.deploy(deployer.address);
        weth = await Weth.deploy();
        router = await Router.deploy(uniswapFac.address, weth.address);
        mockTao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);

        await circulation.initialize(mockTao.address);
        
        //fund address with tao
        await mockTao.transfer(accountWithTao.address, toTao("10000")); //10K Tao
        
   })
    describe("Circulation Supply contract", function () {
    		it("Should add funds to account", async function () {            
				
        		let balance1 = await mockTao.balanceOf(accountWithTao.address);
            	expect(balance1).to.equal(toTao('10000'));

    		});           
            it("Should be correct circulation supply", async function () {            
            let x = await circulation.TAOCirculatingSupply();      
            expect(x).to.be.equal(toTao("80000"));
            })
            it("Should add non circulation address", async function () { 
            let balance1 = await mockTao.balanceOf(accountWithTao.address);
            expect(balance1).to.equal(toTao('10000'));          
            await circulation.setNonCirculatingTAOAddresses([accountWithTao.address]);
            let x1 = await circulation.TAOCirculatingSupply();      
            expect(x1).to.be.equal(toTao("70000"));
            })
    })
})




describe("Exercise CirculationSupply", function() {
    let deployer, investor1, investor2;
    let Busd, busd, MockTao, mockTao;
    let uniswapFac, weth, router, UniswapFac, Weth, Router;
    let Circulation, circulation;
    let Ptao, ptao, Vault, vault;
    let ExercisePTAO, excercisePtao,ExercisePTAold,exercisePTAold;
    let BondingCalculator, bondingCalculator;
    let RewardPool ,rewardPool;
    let UniswapV2FactoryBytecode, UniswapV2FactoryAbi, UniswapV2RouterBytecode, UniswapV2RouterAbi, WETHAbi, WETHBytecode;

     // Uniswap
        UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
        UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
        UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
        UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
        WETHBytecode = WETHBuild.bytecode;
        WETHAbi = WETHBuild.abi;

    beforeEach(async function () {
        [owner, deployer, investor1, investor2, accountWithTao, vester] = await ethers.getSigners();

        Busd = await ethers.getContractFactory("MockBUSD");
        MockTao = await ethers.getContractFactory("MockTAO");
        Vault = await ethers.getContractFactory("Vault");
        Ptao = await ethers.getContractFactory("PreTaoToken");
        ExercisePTAO = await ethers.getContractFactory("ExercisePTAO");
        ExercisePTAOold = await ethers.getContractFactory("ExercisePTAOold");
        Circulation = await ethers.getContractFactory("TAOCirculatingSupplyContract"); 
        BondingCalculator = await ethers.getContractFactory("TaoBondingCalculator");
        RewardPool = await ethers.getContractFactory("RewardPool");
        UniswapFac = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, deployer);
        Router = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  deployer);
        Weth  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  deployer);
        
        
        busd = await Busd.deploy();
        ptao = await Ptao.deploy();
        vault = await Vault.deploy();
        circulation = await Circulation.deploy(owner.address);
        uniswapFac = await UniswapFac.deploy(deployer.address);
        weth = await Weth.deploy();
        bondingCalculator = await BondingCalculator.deploy();
        router = await Router.deploy(uniswapFac.address, weth.address);
        mockTao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);
        exercisePTAold = await ExercisePTAOold.deploy(deployer.address,ptao.address,mockTao.address,busd.address,vault.address,circulation.address );
        excercisePtao = await ExercisePTAO.deploy(owner.address);
        rewardPool = await RewardPool.deploy(mockTao.address);
        //Initialize
        await circulation.initialize(mockTao.address);
        await vault.initialize(mockTao.address, busd.address,bondingCalculator.address ,rewardPool.address);
        await mockTao.setVault(vault.address);
        await excercisePtao.initialize(ptao.address, mockTao.address, busd.address, vault.address,exercisePTAold.address ,circulation.address);
        await vault.setReserveDepositor(excercisePtao.address);
        //fund addresses
        await mockTao.transfer(accountWithTao.address, toTao("10000")); //10K Tao
        await ptao.transfer(vester.address, toWei("1000000"));
        await busd.transfer(vester.address, toWei("10000"));
        
   })
    describe("Circulation Supply contract", function () {
    		it("Should add funds to account", async function () {            
				
        		let balance1 = await mockTao.balanceOf(accountWithTao.address);
            	expect(balance1).to.equal(toTao('10000'));

    		});           
            it("Should be correct circulation supply", async function () {            
            let x = await circulation.TAOCirculatingSupply();      
            expect(x).to.be.equal(toTao("80000"));
            })
            it("Should add non circulation address", async function () { 
            let balance1 = await mockTao.balanceOf(accountWithTao.address);
            expect(balance1).to.equal(toTao('10000'));          
            await circulation.setNonCirculatingTAOAddresses([accountWithTao.address]);
            let x1 = await circulation.TAOCirculatingSupply();      
            expect(x1).to.be.equal(toTao("70000"));
            })
            it("Should have correct pTAO & BUSD amount to vester", async function () { 
            	let balance1 = await ptao.balanceOf(vester.address);
            	let balance2 = await busd.balanceOf(vester.address);
           		
           		expect(balance1).to.equal(toWei('1000000')); 
           		expect(balance2).to.equal(toWei('10000'));  
            })
            it("Should be able to exercise only from Circulation supply", async function () { 
          		let res = await excercisePtao.setTerms(vester.address,toWei("1000000"),1);
          		//set non circulation address
          		await circulation.setNonCirculatingTAOAddresses([accountWithTao.address]);
            	let x1 = await circulation.TAOCirculatingSupply();      
            	expect(x1).to.be.equal(toTao("70000"));
            	//exercise ptao
          		let taoCanClaim = await excercisePtao.getpTAOAbleToClaim(vester.address);

          		expect(taoCanClaim).to.be.equal(toWei("7"));
          		
            })
            it("Should not be able to exercise after exercise too much", async function () { 


                  await excercisePtao.setTerms(vester.address,toWei("1000000"),1);
                  await ptao.addApprovedSeller(vester.address);
                 //Can claim only 8 tao
                  expect(await excercisePtao.getpTAOAbleToClaim(vester.address)).to.be.equal(toWei("8"));
                  //excercise max allowed
                  await busd.connect( vester ).approve(excercisePtao.address, toWei('8'));
                  await ptao.connect( vester ).approve(excercisePtao.address, toWei('8'));
                  await excercisePtao.connect( vester ).exercisepTAO( toWei('8') );

                  let balance = await mockTao.balanceOf(vester.address);
                  expect(balance).to.be.equal(toTao("8"));

                  // expect(await excercisePtao.getpTAOAbleToClaim(vester.address)).to.be.low(toWei("8"));
                  // set non circulation address
                  await circulation.setNonCirculatingTAOAddresses([accountWithTao.address]);
                  let x1 = await circulation.TAOCirculatingSupply();      
                  expect(x1).to.be.equal(toTao("70008"));
                   
                   //exercise ptao                 
                  await expect( excercisePtao.getpTAOAbleToClaim(vester.address)).to.be.revertedWith("revert Claimed more then possible");

                  await busd.connect( vester ).approve(excercisePtao.address, toWei('8'));
                  await ptao.connect( vester ).approve(excercisePtao.address, toWei('8'));
                  await expect(excercisePtao.connect( vester ).exercisepTAO( toWei('8') )).to.be.revertedWith("revert Claimed more then possible");
                     
                  
            })
    })
})