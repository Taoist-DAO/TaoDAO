module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    const token = await deployments.get("TaoToken")

    await deploy('RewardPool', {
        from: deployer,
        args: [token.address],
        log: true,
    })

}
module.exports.tags = ["RewardPool", "bsctestnet"]
module.exports.dependencies = ["TaoToken"]
