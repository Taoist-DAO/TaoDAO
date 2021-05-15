module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments
    const { deployer, dev } = await getNamedAccounts()

    // Settings
    const daowallet = "0xD98C22Bbd1966D47B6a6ae8F6aB3150CeeA81167"
    const daoshare = "10" // 10%
    const lpshare = "2" // 50%
    const bcv = "30" //
    const vestingPeriod ="300" //15 min
    const minPremium = "1500" // 17
    const epochLength = "300" // 15 min
    const nextEpochBlock = "7971470" // (1 hour = 1200)
    const StakingRewardRate = "40" // 50 = 0.5%
    const LPRewardRate = "5000000"// per block 5000000 = 0.005 Tao Per Block, 48 Per Epoch, 144 Tao per day

    // Import Contracts
    const vault = await ethers.getContract("Vault")
    const bondingCalculator = await ethers.getContract("TaoBondingCalculator")
    const tao = await ethers.getContract("TaoToken")
    const sTao = await ethers.getContract("sTaoToken")
    const rewardPool = await ethers.getContract("RewardPool")
    const busd = await ethers.getContract("MockBUSD")
    const staking = await ethers.getContract("TaoStaking")
    const bonding = await ethers.getContract("TAOPrincipleDepository")
    const factory = await ethers.getContract("PancakeFactory")
    const rewardDistributor = await ethers.getContract("TaoRewardDistributor")
    const taoLPStaking = await ethers.getContract("TaoLPStaking")

    //Initialize Vault
    if( await vault.callStatic.isInitialized() === false ){
        await vault.initialize(tao.address, busd.address, bondingCalculator.address, rewardPool.address)
    } else {
        console.log(`Vault Already Initialized`)
    }
    await vault.setDAOWallet(daowallet)
    await vault.setStakingContract(staking.address)
    await vault.setLPProfitShare("2")

    //Initialize Token & sToken
    await tao.setVault(vault.address)
    await sTao.setStakingContract(staking.address)
    await sTao.setMonetaryPolicy(staking.address)

    //Initialize LP staking
    await taoLPStaking.setRewardPerBlock(LPRewardRate)


    //Initialize Bonding
    if( await bonding.callStatic.isInitialized() === false ){
        pairAddress = await factory.callStatic.createPair(busd.address, tao.address)
        await bonding.initialize(pairAddress, tao.address)
    } else {
        console.log(`Principle Depository Already Initialized`)
    }
    await bonding.setAddresses(
        bondingCalculator.address,
        vault.address,
        staking.address,
        rewardPool.address,
        daowallet,
        daoshare,
        lpshare
        )
    await bonding.setBondTerms(
        bcv,
        vestingPeriod,
        minPremium
        )

    //Initialize Staking
        await staking.initialize(tao.address, sTao.address, epochLength)
    if( await rewardDistributor.callStatic.isInitialized() === false ){
        await rewardDistributor.initialize(
            nextEpochBlock,
            epochLength,
            StakingRewardRate,
            vault.address,
            staking.address,
            tao.address,
            busd.address
            )
    } else {
        console.log(`Reward Distributor Already Initialized`)
    }


}

module.exports.tags = ["bsctestnetInit"]
module.exports.dependencies = ["Vault", "TaoBondingCalculator", "TaoToken", "RewardPool", "TaoStaking", "TAOPrincipleDepository", "TaoLPStaking"]
