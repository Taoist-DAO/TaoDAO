// const { expect } = require("chai");
// const { fromWei, toWei, toTao, fromTao, printTaoBalance, printBalanceToWei,
//     mineBlocks, increaseTime, hardhatSnapshot, hardhatRevert } = require("./utils/test_helpers.ts");
// describe("PreTaoSales", function() {
// 	let PreTaoSales, Busd,Ptao, MockTao, Factory, factory, Router, router,ptao, busd, mockTao, owner, investor1, investor2, investor;
// 	beforeEach(async function () {
		

// 		Busd = await ethers.getContractFactory("MockBUSD");
// 		PreTaoSales = await ethers.getContractFactory("PreTaoSales");
// 		Ptao = await ethers.getContractFactory("PreTaoToken");
// 		[owner, investor1, investor2, investor, bot, bank, AbortController_] = await ethers.getSigners();

// 		busd = await Busd.deploy();
// 		ptao = await Ptao.deploy();
// 		preTaoSales = await PreTaoSales.deploy();

// 		// Transfer Busd to investors.
//         await busd.transfer(investor1.address, toWei('100000000')); //100K busd
//         let res = await preTaoSales.approveBuyers([investor1.address, investor2.address]);	

// 	})
	
// 	describe("Investor actions", function () {
// 		it("Should initialize", async function () {
//             const balance = await preTaoSales.initialize(ptao.address, busd.address, 1,investor2.address);

//         });
//         it("Should be able to transfer (1)", async function (){

//         	 let investor1Balance = await busd.balanceOf(investor1.address);
//              expect(investor1Balance).to.equal(toWei("100000000"));
//         })
//         it("Should be able to buy", async function (){

//         	await preTaoSales.connect( investor1 ).buypTao(toWei("9000000"));

//         	let investor1Balance = await busd.balanceOf(investor1.address);
//             expect(investor1Balance).to.equal(toWei("10000000"));     	        	      
//         })      
//         it("Should not be able to buy", async function (){
        	 
//         	 await expect( preTaoSales.connect( investor1 ).buypTao(toWei("9000001")))
//         	 .to.be.revertedWith("revert Amount paid is over the limit");
        	 

             
//         })      

//     })
// })