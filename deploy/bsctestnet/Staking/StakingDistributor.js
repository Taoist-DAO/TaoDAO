module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()


    const stakingDistributor = await deploy('TaoStakingDistributor', {
        from: deployer,
        log: true,
    })
}
module.exports.tags = ["TaoStakingDistributor", "bsctestnet"]
