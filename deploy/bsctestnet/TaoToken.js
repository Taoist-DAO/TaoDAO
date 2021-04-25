module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer, dev } = await getNamedAccounts()

    await deploy('TaoToken', {
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["TaoToken", "bsctestnet"]
