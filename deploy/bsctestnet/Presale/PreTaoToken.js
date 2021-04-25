module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer, dev } = await getNamedAccounts()

    await deploy('PreTaoToken', {
        from: deployer,
        log: true,
    })
}

module.exports.tags = ["PreTaoToken", "bsctestnet"]
