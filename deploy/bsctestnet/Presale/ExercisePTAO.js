module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments

    const { deployer, dev } = await getNamedAccounts()

    const pTAO = await deployments.get("PreTaoToken")
    const TAO = await deployments.get("TaoToken")
    const vault = await deployments.get("Vault")
    const busd = await ethers.getContract("MockBUSD")




    //constructor( address _owner, address _pTAO, address _TAO, address _BUSD, address _treasury)
    await deploy('ExercisePTAO', {
        from: deployer,
        args: [deployer, pTAO.address, TAO.address, busd.address, vault.address],
        log: true,
    })
}

module.exports.tags = ["ExercisePTAO", "bsctestnet"]
module.exports.dependencies = ["PreTaoToken", "TaoToken", "Vault"]
