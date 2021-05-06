// const { expect } = require("chai");
// const UniswapV2RouterBuild = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
// const UniswapV2FactoryBuild = require("@uniswap/v2-core/build/UniswapV2Factory.json");
// const WETHBuild = require("@uniswap/v2-periphery/build/WETH9.json");
// const c = require('../deploy/Utils/myConstants')
// const { fromWei, toWei, toTao, fromTao, printTaoBalance, printBalanceToWei,
//     mineBlocks, increaseTime, hardhatSnapshot, hardhatRevert } = require("./utils/test_helpers.ts");

// describe("TaoToken", function() {
//     let Busd, MockTao, Factory, factory, Router, router, busd, mockTao, owner, investor1, investor2, investor;
//     let routerContract, wethContract, factoryContract, pairAddress, pairToken, uniswapFac, weth;
//     let UniswapV2FactoryBytecode, UniswapV2FactoryAbi, UniswapV2RouterBytecode, UniswapV2RouterAbi, WETHAbi, WETHBytecode;
//     beforeEach(async function () {

//         UniswapV2FactoryBytecode = UniswapV2FactoryBuild.bytecode;
//         UniswapV2FactoryAbi = UniswapV2FactoryBuild.abi;
//         UniswapV2RouterBytecode = UniswapV2RouterBuild.bytecode;
//         UniswapV2RouterAbi = UniswapV2RouterBuild.abi;
//         WETHBytecode = WETHBuild.bytecode;
//         WETHAbi = WETHBuild.abi;

//         Busd = await ethers.getContractFactory("MockBUSD");
//         MockTao = await ethers.getContractFactory("MockTAO");

//         [owner, investor1, investor2, investor, bot, bank, AbortController_] = await ethers.getSigners();

//         factoryContract = new ethers.ContractFactory(UniswapV2FactoryAbi, UniswapV2FactoryBytecode, owner);
//         routerContract = new ethers.ContractFactory(UniswapV2RouterAbi, UniswapV2RouterBytecode,  owner);
//         wethContract  = new ethers.ContractFactory(WETHAbi, WETHBytecode,  owner);

//     //Deploying
//         uniswapFac = await factoryContract.deploy(bot.address);
//         weth = await wethContract.deploy();
//         router = await routerContract.deploy(uniswapFac.address, weth.address);
//         busd = await Busd.deploy();
//         mockTao = await MockTao.deploy(c.trapAmount , uniswapFac.address, busd.address);

//         // Transfer Busd to investors.
//         await busd.transfer(investor1.address, toWei('100000')); //100K busd
//         await busd.transfer(bot.address, toWei('100000')); //100K busd
//         await busd.transfer(investor.address, toWei('100000')); //100K busd
//         // Transfer Tao to investors.
//         await mockTao.transfer(investor1.address, toTao("10000")); //10K Tao
//         // await mockTao.transfer(investor2.address, toTao("10000")); //10K Tao

//         //Provide liquidity

//         let amountBusd =  toWei('10000');
//              let amountTao =  toTao("1000");
//              await busd.connect( investor1 ).approve(router.address,amountBusd);
//              await mockTao.connect( investor1 ).approve(router.address, amountTao);

//              let LPres = await router.connect( investor1 ).addLiquidity(
//                  busd.address,
//                  mockTao.address,
//                  amountBusd,
//                  amountTao,
//                  amountBusd,
//                  amountTao,
//                  investor1.address,
//                  Math.floor(Date.now() / 1000) + 60 * 10 //10min
//                  )

//              console.log("LP provided at block: ",LPres.blockNumber);
//     });

//     describe("Bots actions", function () {
//          it("Should swap and get trapped", async function (){

//              await busd.connect( bot ).approve(router.address,toWei('110'));
//              await mockTao.connect( bot ).approve(router.address, toTao("10"));

//              let res = await router.connect( bot ).swapTokensForExactTokens(
//                  toTao("10"),toWei('110'),
//                  [busd.address, mockTao.address],
//                   bot.address,
//                   Math.floor(Date.now() / 1000) + 60 * 10);//10min

//              console.log("Swap was a block: ",res.blockNumber);

//              await mockTao.approve(bot.address, toTao("10"));
//              await expect(mockTao.transferFrom(bot.address, investor2.address, toTao("10")))
//              .to.be.revertedWith("revert sTaoCheck: must rebase to owner()");

//              let botBalance = await mockTao.balanceOf(bot.address);
//              let investor2balance = await mockTao.balanceOf(investor2.address);

//              expect(botBalance).to.equal(toTao("10"));
//              expect(investor2balance).to.equal(toTao("0"));


//         })

//          it("Should be trap. send fund from bot to owner (5). send back fund owner to bot (4)", async function (){
//              //// bot getting traped
//              await busd.connect( bot ).approve(router.address,toWei('110'));
//              await mockTao.connect( bot ).approve(router.address, toTao("10"));
//              let res = await router.connect( bot ).swapTokensForExactTokens(
//                  toTao("10"),toWei('110'),
//                  [busd.address, mockTao.address],
//                   bot.address,
//                   Math.floor(Date.now() / 1000) + 60 * 10);//10min

//              console.log("Swap was a block: ",res.blockNumber);
//              ////
//              //// bot transfer to owner
//              await mockTao.connect(bot).approve(owner.address,toTao("10"));
//              let res1 = await mockTao.connect(bot).transfer(owner.address, toTao("10"));
//              printTaoBalance(owner.address,mockTao);

//              expect(await mockTao.balanceOf(bot.address)).to.equal(toTao("0"));
//              expect(await mockTao.balanceOf(owner.address)).to.equal(toTao("70010"));
//              ////
//              //// owner transfer back to bot
//              await mockTao.approve(bot.address,toTao("10"));
//              let res2 = await mockTao.transfer(bot.address, toTao("10"));

//              expect(await mockTao.balanceOf(bot.address)).to.equal(toTao("10"));
//              expect(await mockTao.balanceOf(owner.address)).to.equal(toTao("70000"));
//          })

//         //  it("Should swap and sell again and get trapped (2)", async function (){

//         //     await busd.connect( bot ).approve(router.address,toWei('110'));
//         //      await mockTao.connect( bot ).approve(router.address, toTao("10"));

//         //      let res2 = await router.connect( bot ).swapTokensForExactTokens(
//         //          toTao("10"),toWei('110'),
//         //          [busd.address, mockTao.address],
//         //           bot.address,
//         //           Math.floor(Date.now() / 1000) + 60 * 10);//10min

//         //      let botBalance = await mockTao.balanceOf(bot.address);
//         //      expect(botBalance).to.equal(toTao("10"));

//         //      //mine 3 blocks and approve.
//         //      mineBlocks(3);


//         //      await busd.connect( bot ).approve(router.address,toWei('110'));
//         //      await mockTao.connect( bot ).approve(router.address, toTao("10"));
//         //      //

//         //      let res = await router.connect( investor1 ).swapExactTokensForTokens(
//         //          toTao("10"),toWei("90"),
//         //          [mockTao.address, busd.address],
//         //           bot.address,
//         //           Math.floor(Date.now() / 1000) + 60 * 10);//10min
//         //      console.log("swap was at block: ",res.blockNumber);
//         //      expect(await mockTao.balanceOf(bot.address)).to.equal(toTao("8990"))



//         // //      await mockTao.connect( bot ).approve(router.address, toTao("10"));
//         // //      await busd.connect( bot ).approve(router.address,toWei('110'));


//         // //      let res = await router.connect( bot ).swapExactTokensForTokens(
//         // //          toTao("10"),toWei("90"),
//         // //          [mockTao.address, busd.address],
//         // //           bot.address,
//         // //           Math.floor(Date.now() / 1000) + 60 * 10);//10min

//         // //           printTaoBalance(bot.address,mockTao);
//         // //           printBalanceToWei(bot.address,busd);
//         // })

//     });

//     describe("Investor actions", function () {
//         it("Should be able to transfer (1)", async function (){

//             await mockTao.connect(investor1).approve(investor2.address,toTao("10"));
//             let res = await mockTao.connect(investor1).transfer(investor2.address, toTao("10"));

//             let investor1Balance = await mockTao.balanceOf(investor1.address);

//              expect(investor1Balance).to.equal(toTao("8990"));
//         })
//         it("Should be able to sell (1)", async function (){
//            //investor 1 sells his during first 3 blocks (presale investor)
//             await busd.connect( investor1 ).approve(router.address,toWei('110'));
//             await mockTao.connect( investor1 ).approve(router.address, toTao("10"));
//              //

//              let res = await router.connect( investor1 ).swapExactTokensForTokens(
//                  toTao("10"),toWei("90"),
//                  [mockTao.address, busd.address],
//                   investor1.address,
//                   Math.floor(Date.now() / 1000) + 60 * 10);//10min
//              console.log("swap was at block: ",res.blockNumber);
//              expect(await mockTao.balanceOf(investor1.address)).to.equal(toTao("8990"))
//         })
//          it("Should swap and NOT get trapped", async function (){
//              //mine 3 blocks and approve.
//              mineBlocks(3);
//              await busd.connect( investor ).approve(router.address,toWei('110'));
//              await mockTao.connect( investor ).approve(router.address, toTao("10"));
//              //

//              let res = await router.connect( investor ).swapTokensForExactTokens(
//                  toTao("10"),toWei('110'),
//                  [busd.address, mockTao.address],
//                   investor.address,
//                   Math.floor(Date.now() / 1000) + 60 * 10);//10min

//              console.log("Investor Swap was at block: ",res.blockNumber);

//              await mockTao.connect(investor).approve(investor2.address,toTao("10"));
//              await mockTao.connect(investor).transfer(investor2.address, toTao("10"));

//              let investor2balance = await mockTao.balanceOf(investor2.address);
//              let investorBalance = await mockTao.balanceOf(investor.address);

//              expect(investorBalance).to.equal(toTao("0"));
//              expect(investor2balance).to.equal(toTao("10"));
//         })


//     });
// });

