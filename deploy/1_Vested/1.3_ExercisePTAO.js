module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId}) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()

    const pTAO = await deployments.get("PreTaoToken")
    const TAO = await deployments.get("TaoToken")
    const vault = await deployments.get("Vault")
    //const circulating = await deployments.get("TAOCirculatingSupplyContract")

    let busd
    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
    } else {
        throw Error("No BUSD!")
    }

    //constructor( address _owner, address _pTAO, address _TAO, address _BUSD, address _treasury)
    await deploy('ExercisePTAO', {
        from: deployer,
        args: [deployer, pTAO.address, TAO.address, busd.address, vault.address],
        log: true,
    })


    const exercisePTAO = await ethers.getContract("ExercisePTAO")
    // // ExercisePTAO Verify
    // await hre.run("verify:verify", {
    //     address: exercisePTAO.address,
    //     constructorArguments: [
    //     deployer,
    //     pTAO.address,
    //     TAO.address,
    //     busd.address,
    //     vault.address,
    //     ],
    // })
}
module.exports.tags = ["ExercisePTAO"]
module.exports.dependencies = ["PreTaoToken", "TaoToken", "Vault"]
