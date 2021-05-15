module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId}) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev } = await getNamedAccounts()
    const c = require('./myConstants');

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
        // Token
        const tao = await deployments.get("TaoToken")
    //     await hre.run("verify:verify", {
    //         address: tao.address,
    //         constructorArguments: [
    //         c.trapAmount,
    //         factory.address,
    //         busd.address]
    // })
    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
        // Token
        const tao = await deployments.get("SimpleTaoToken")
        await hre.run("verify:verify", {
            address: tao.address,
        })
    } else {
        throw Error("No deployments found!")
    }

    //Contracts
    const vault = await deployments.get("Vault");
    const rewardPool = await deployments.get("RewardPool");
    const tao = await deployments.get("TaoToken");
    const sTao = await deployments.get("sTaoToken");
    const pTao = await deployments.get("PreTaoToken")
    const bondingCalculator = await deployments.get("TaoBondingCalculator");
    const stakingDistributor = await deployments.get("TaoStakingDistributor");
    const principle = await deployments.get("TAOPrincipleDepository");
    const staking = await deployments.get("TaoStaking");
    const LPstaking = await deployments.get("TaoLPStaking");
    //const circulating = await deployments.get("TAOCirculatingSupplyContract")
    const presale = await deployments.get("TaoPresale")
    const exercisePTAO = await deployments.get("ExercisePTAO")

    const factory = await ethers.getContract("PancakeFactoryV2");
    const pairAddress = await factory.callStatic.createPair(busd.address, tao.address)
    console.log(`LP Pair Address: ${pairAddress}`)

    // //  // Vault
    // // await hre.run("verify:verify", {
    // //     address: vault.address,
    // // })

    // // sToken
    // await hre.run("verify:verify", {
    //     address: sTao.address,
    // })


    // // BondingCalculator
    // await hre.run("verify:verify", {
    //     address: bondingCalculator.address,
    // })

    // // StakingDistributor
    // await hre.run("verify:verify", {
    //     address: stakingDistributor.address,
    // })

    // // PrincipleDepository
    // await hre.run("verify:verify", {
    //     address: principle.address,
    // })

    // // TaoStaking
    // await hre.run("verify:verify", {
    //     address: staking.address,
    // })

    // // RewardPool
    // await hre.run("verify:verify", {
    //     address: rewardPool.address,
    //     constructorArguments: [
    //     tao.address,
    //     ],
    // })

    // // // ExercisePTAO
    // // await hre.run("verify:verify", {
    // //     address: exercisePTAO.address,
    // //     constructorArguments: [
    // //     deployer,
    // //     pTao.address,
    // //     tao.address,
    // //     busd.address,
    // //     vault.address,
    // //     ],
    // // })


    // // TaoLPStaking
    // const pairaddress = await factory.callStatic.createPair(busd.address, tao.address)
    // await hre.run("verify:verify", {
    //     address: LPstaking.address,
    //     constructorArguments: [
    //     pairaddress,
    //     tao.address,
    //     rewardPool.address,
    //     c.LPRewardRate,
    //     c.blocksToWait,
    //     ],
    // })

}

module.exports.tags = ["verifyMain"]
module.exports.dependencies = ["sTaoToken", "TaoToken", "Vault", "RewardPool", "TaoBondingCalculator", "TAOPrincipleDepository",
 "TaoLPStaking", "TaoPresale", "ExercisePTAO", "PreTaoToken"]
