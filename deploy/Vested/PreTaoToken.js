module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    await deploy('PreTaoToken', {
        from: deployer,
        log: true,
    })

    const pTao = await deployments.get("PreTaoToken")
    await hre.run("verify:verify", {
        address: pTao.address,
    })
}

module.exports.tags = ["PreTaoToken", "Vested"]
