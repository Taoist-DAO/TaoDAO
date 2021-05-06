module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    await deploy('PreTaoSales', {
        from: deployer,
        log: true,
    })

    const pTaoSales = await deployments.get("PreTaoSales")
    await hre.run("verify:verify", {
        address: pTaoSales.address,
    })
}

module.exports.tags = ["PreTaoSales", "Vested"]
