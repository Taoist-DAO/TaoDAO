module.exports = async function ({ ethers, deployments, getNamedAccounts, getChainId }) {
    const { deploy } = deployments
    const chainId = await getChainId()
    const { deployer, dev, DAO } = await getNamedAccounts()
    const c = require('./myConstants')

    let busd, log, tx, tao, router, factory;

    const now = await web3.eth.getBlockNumber();
    console.log(`current block: ${now}`);
    const nextEpochBlock = "8506350"; // test
    //const nextEpochBlock = "8497280"; // 8pm
    console.log(`nextEpochBlock: ${nextEpochBlock}`);
    const amount = "1000000000000000000"; // 1,000,000,000 x 1e9

    if (chainId == `56`) { //BSC Mainnet
        busd = await ethers.getContract("BUSD")
        factory = await ethers.getContract("PancakeFactoryV2")
        router = await ethers.getContract("PancakeRouterV2")
        tao = await ethers.getContract("TaoToken")

    } else if (chainId == '97') { //BSC Testnet
        busd = await ethers.getContract("MockBUSD")
        factory = await ethers.getContract("PancakeFactory")
        router = await ethers.getContract("PancakeRouter")
        tao = await ethers.getContract("SimpleMockTao")
    } else {
        throw Error("No Deployments Found!")
    }

    console.log(deployer)
    //================================Import Contracts===================================
    const vault = await ethers.getContract("Vault");
    const rewardPool = await ethers.getContract("RewardPool");
    const sTao = await ethers.getContract("sTaoToken");
    const bondingCalculator = await ethers.getContract("TaoBondingCalculator");
    const stakingDistributor = await ethers.getContract("TaoStakingDistributor");
    const principle = await ethers.getContract("TAOPrincipleDepository");
    const staking = await ethers.getContract("TaoStaking");
    const LPstaking = await ethers.getContract("TaoLPStaking");
    //const circulating = await ethers.getContract("TAOCirculatingSupplyContract")
    const presale = await ethers.getContract("TaoPresale")

    const pairAddress = await factory.callStatic.createPair(busd.address, tao.address)
    //const pairAddress = await factory.getPair(busd.address, tao.address)
    console.log(`LP Pair Address: ${pairAddress}`)

    //================================Initialize Vault===================================
    if( await vault.callStatic.isInitialized() === false ){
        await vault.initialize(tao.address, busd.address, bondingCalculator.address, rewardPool.address);
    } else {
        console.log(`Vault Already Initialized`);
    }

    //Set Vault address in Tao Token, Then set Principle Token in Vault.
    await tao.setVault(vault.address);
    console.log("test")
    tx = await vault.setPrincipleToken(pairAddress);
    await tx.wait();
    log = await vault.getPrincipleToken();
    console.log(`Principle Token Address: ${log}`);

    // Set Dao Wallet
    tx = await vault.setDAOWallet(DAO);
    await tx.wait();
    log = await vault.daoWallet();
    console.log(`DAO Address: ${log}`);
    // Set Staking Contract
    tx = await vault.setStakingContract(staking.address);
    await tx.wait();
    log = await vault.stakingContract();
    console.log(`Staking Address: ${log}`);
    // Set LP profit share
    tx = await vault.setLPProfitShare(c.LPProfitShare);
    await tx.wait();
    log = await vault.LPProfitShare();
    console.log(`LP Profit Share: ${log}`);
    // Set reserve depositor
    tx = await vault.setReserveDepositor(deployer);
    await tx.wait();
    log = await vault.isReserveDepositor(deployer);
    console.log(`Deployer is Reserve?: ${log}`);
    tx = await vault.setReserveDepositor(stakingDistributor.address);
    await tx.wait();
    log = await vault.isReserveDepositor(stakingDistributor.address);
    tx = await vault.setReserveDepositor(presale.address);
    await tx.wait();
    log = await vault.isReserveDepositor(stakingDistributor.address);
    console.log(`Staking Distributor is Reserve?: ${log}`);
    // Set Principle Depositor
    tx = await vault.setPrincipleDepositor(principle.address);
    await tx.wait();
    log = await vault.isPrincipleDepositor(principle.address);
    console.log(`Principle Depositor is Principle?: ${log}`);


    //================================Initialize LP========================================
    await rewardPool.allowTransferToStaking(LPstaking.address, amount);
    await LPstaking.setRewardPerBlock(c.LPRewardRate);

    // //circulating supply
    // if( await circulating.callStatic.isInitialized() === false ){
    //     await circulating.initialize(tao.address);
    // } else {
    //     console.log(`CircSupply Already Initialized`);
    // }
    //================================Initialize Bonding===================================
    if( await principle.callStatic.isInitialized() === false ){
        await principle.initialize(pairAddress, tao.address);
    } else {
        console.log(`Principle Depository Already Initialized`);
    }

    await principle.setAddresses(bondingCalculator.address, vault.address, stakingDistributor.address,
        rewardPool.address, DAO, c.DAOProfitShare, c.LPProfitShare);
    await principle.setBondTerms(c.BCV, c.bondVestingPeriod, c.minPremium);

    //================================Initialize STAKING===================================
    if( await staking.callStatic.isInitialized() === false ){
        await staking.initialize(tao.address, sTao.address, c.blocksInEpoch);
    } else {
        console.log(`Staking Already Initialized`);
    }
    if( await stakingDistributor.callStatic.isInitialized() === false ){
        await stakingDistributor.initialize(nextEpochBlock, c.blocksInEpoch, c.rewardRate,
        vault.address, staking.address, tao.address, busd.address, DAO);
    } else {
        console.log(`Staking Distributor Already Initialized`);
    }

    tx = await sTao.setStakingContract(staking.address);
    await tx.wait();
    log = await sTao.stakingContract();
    console.log(`Staking Contract Address: ${log}`);
    tx = await sTao.setMonetaryPolicy(staking.address);
    await tx.wait();
    log = await sTao.monetaryPolicy();
    console.log(`Monetary Policy Address: ${log}`);
}
module.exports.tags = ["initMain"]
