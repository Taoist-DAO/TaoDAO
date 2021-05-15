module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainid }) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()

    let tao

    if (chainId == `56`) { //BSC Mainnet
        tao = await deployments.get("TaoToken")

    } else if (chainId == '97') { //BSC Testnet
        tao = await deployments.get("SimpleMockTao")
    } else {
        throw Error("No Deployments Found!")
    }

    await deploy('RewardPool', {
        from: deployer,
        args: [tao.address],
        log: true,
    })

}
module.exports.tags = ["RewardPool", "LP", "main"]
module.exports.dependencies = ["TaoToken", "SimpleMockTao"]
