module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    await deploy('Vault', {
        from: deployer,
        log: true,
    })
    // const vault = await deployments.get("Vault")
    // await hre.run("verify:verify", {
    //     address: vault.address,
    // })
}
module.exports.tags = ["Vault", "main"]
