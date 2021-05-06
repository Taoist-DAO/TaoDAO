module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId}) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()
    const c = require('../Utils/myConstants');

    let busd, factory, tao


    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
        factory = await ethers.getContract("PancakeFactoryV2")
        tao = await deployments.get("TaoToken")

    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
        factory = await ethers.getContract("PancakeFactory")
        tao = await deployments.get("SimpleMockTao")
    } else {
        throw Error("No Deployments Found!")
    }

    const RewardPool = await deployments.get("RewardPool")
    console.log(`Factory is: ${factory.address}`)
    console.log(`Busd is: ${busd.address}`)

    const pairAddress = await factory.callStatic.createPair(busd.address, tao.address)
    console.log(`LP Pair Address: ${pairAddress}`)

    await deploy('TaoLPStaking', {
        from: deployer,
        args: [pairAddress, tao.address, RewardPool.address, c.LPRewardRate, c.blocksToWait],
        log: true,
    })
}
module.exports.tags = ["TaoLPStaking", "LP", "main"]
module.exports.dependencies = ["TaoToken", "RewardPool", "SimpleMockTao"]

