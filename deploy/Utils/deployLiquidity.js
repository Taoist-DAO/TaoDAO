module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId }) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev} = await getNamedAccounts()
    const c = require('./myConstants')

    let tao, busd, factory, router
    function toWei(n) {
        return ethers.utils.parseEther(n).toString();
    }
    function toTao(n) {
        return ethers.utils.parseUnits(n, 9).toString();
    }
    function fromWei(n) {
        return ethers.utils.formatEther( n ).toString();
    }
    function fromTao(n) {
        return ethers.utils.formatUnits (n, 9).toString();
    }

    // Get Contracts
    const presale = await ethers.getContract("TaoPresale")
    const vault = await ethers.getContract("Vault")
    const rewardPool = await ethers.getContract("RewardPool")
    const stakingPool = await ethers.getContract("TaoStakingDistributor")

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
        factory = await ethers.getContract("PancakeFactoryV2")
        router = await ethers.getContract("PancakeRouterV2")
        tao = await ethers.getContract("TaoToken")

    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
        factory = await ethers.getContract("PancakeFactory")
        router = await ethers.getContract("PancakeRouter")
        tao = await ethers.getContract("SimpleMockTao")
    } else {
        throw Error("No Deployments Found!")
    }

    // Settings
    // List price 32
    const amount1 = toTao("10000") //Tao 10,000
    const amount2 = toWei("320000")//Busd 400,000
    const mintAmount = toWei("23128") //busd 25,000
    const sendAmount1 = toTao("11564") //tao 25,000
    const sendAmount2 = toTao("11564") //tao 25,000
    console.log(` tao add ${fromTao(amount1)}`)
    console.log(` busd add ${fromWei(amount2)}`)
    console.log(` tao address ${tao.address}`)
    console.log(` busd address ${busd.address}`)
    console.log(` router address ${router.address}`)
    console.log(` deployer address ${deployer}`)

    // claimUnlock, Withdraw and Mint Tao
    if( await presale.callStatic.claimUnlocked() === false ){
        await presale.unlockClaim()
    } else {
        console.log(`claim already unlocked`);
    }
    console.log("test1")
    await presale.withdrawRemainingBusd()
    console.log("test2")
    await busd.approve(vault.address, mintAmount)
    console.log("test3")
    await vault.depositReserves(mintAmount,{
    gasLimit: 250000
    });
    console.log("test4")
    await tao.transfer(rewardPool.address, sendAmount1,{
    gasLimit: 250000
    })
    await tao.transfer(stakingPool.address, sendAmount2,{
    gasLimit: 250000
    })
    console.log("test5")

    // Add liquidity
    await factory.createPair(tao.address, busd.address,{
    gasLimit: 250000
    })
    const pairAddress = await factory.getPair(tao.address, busd.address,{
    gasLimit: 250000
    })
    console.log(` pair address ${pairAddress}`)
    await tao.approve(router.address, amount1,{
    gasLimit: 250000
    })
    await busd.approve(router.address, amount2,{
    gasLimit: 250000
    })
    await router.addLiquidity(
        tao.address,
        busd.address,
        amount1,
        amount2,
        amount1,
        amount2,
        deployer,
        Math.floor(Date.now() / 1000) + 60 * 10 //10min
        )

}
module.exports.tags = ["addLiquidity"]
module.exports.dependencies = ["TaoToken", "SimpleMockTao", "TaoPresale", "Vault", "RewardPool","TaoStakingDistributor"]

