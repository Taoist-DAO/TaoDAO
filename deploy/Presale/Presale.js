module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId }) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()

    let busd

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
    } else {
        throw Error("No BUSD!")
    }

    await deploy('TaoPresale', {
        from: deployer,
        args: [busd.address],
        log: true,
    })

    const presale = await deployments.get("TaoPresale")
    await hre.run("verify:verify", {
        address: presale.address,
        constructorArguments: [
        busd.address,
        ],
    })
}

module.exports.tags = ["TaoPresale", "presale"]
