module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId}) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()
    const c = require('./Utils/myConstants');

    let busd, factory

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
        factory = await ethers.getContract("PancakeFactoryV2")

        await deploy('TaoToken', {
        from: deployer,
        args: [c.trapAmount, factory.address, busd.address],
        log: true,
    })

    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
        factory = await ethers.getContract("PancakeFactory")

        await deploy('SimpleMockTao', {
        from: deployer,
        log: true,
    })
    } else {
        throw Error("No Deployments Found!")
    }

}

module.exports.tags = ["TaoToken", "SimpleMockTao"]
