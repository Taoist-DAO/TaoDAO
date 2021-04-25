module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()
    const c = require('./myConstants');

    // Get Contracts
    const RewardPool = await deployments.get("RewardPool")
    const tao = await deployments.get("TaoToken")
    const busd = await ethers.getContract("MockBUSD")
    const factory = await ethers.getContract("PancakeFactory")

    console.log(`Factory is: ${factory.address}`)
    console.log(`Busd is: ${busd.address}`)

    const pairAddress = await factory.callStatic.createPair(busd.address, tao.address)
    //const pairAddress = await factory.getPair(busd.address, tao.address)

    console.log(`LP Pair Address: ${pairAddress}`)

    await deploy('TaoLPStaking', {
        from: deployer,
        args: [pairAddress, tao.address, RewardPool.address, c.LPRewardRate, c.dayInBlocks],
        log: true,
    })
}
module.exports.tags = ["TaoLPStaking", "bsctestnet"]
module.exports.dependencies = ["TaoToken", "RewardPool"]

