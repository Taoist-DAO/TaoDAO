module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    await deploy('TaoStaking', {
        from: deployer,
        log: true,
    })

}
module.exports.tags = ["TaoStaking", "Staking", "main"]


