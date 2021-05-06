module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId}) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()

    let busd

    const pTAO = await deployments.get("PreTaoToken")
    const TAO = await deployments.get("TaoToken")
    const vault = await deployments.get("Vault")

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
    } else {
        throw Error("No BUSD!")
    }

    await deploy('ExercisePTAO', {
        from: deployer,
        args: [deployer, pTAO.address, TAO.address, busd.address, vault.address],
        log: true,
    })

    const exercisePTAO = await ethers.getContract("ExercisePTAO")
    await hre.run("verify:verify", {
        address: exercisePTAO.address,
        constructorArguments: [
        deployer,
        pTAO.address,
        TAO.address,
        busd.address,
        vault.address,
        ],
    })
}
module.exports.tags = ["ExercisePTAO"]
module.exports.dependencies = ["PreTaoToken", "TaoToken", "Vault"]
