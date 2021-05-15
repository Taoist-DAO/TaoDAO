module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments;
    const { deployer, dev } = await getNamedAccounts();

    // Settings
    let log, tx;

    const blocksInEpoch = "4800"; //9600 = 8 Hours 4800 = 4 Hours


    // Get Contracts
    const stakingDistributor = await ethers.getContract("TaoStakingDistributor");
    const staking = await ethers.getContract("TaoStaking");

    tx = await staking.setEpochLengthintBlock(blocksInEpoch);
    await tx.wait();
    log = await staking.epochLengthInBlocks();
    console.log(`Staking epoch set at: ${log}`);

    tx = await stakingDistributor.setBlocksInEpoch(blocksInEpoch);
    await tx.wait();
    log = await stakingDistributor.blocksInEpoch();
    console.log(`Distributor epoch set at: ${log}`);

    //nextEpochBlock
    const now = await web3.eth.getBlockNumber();
    console.log(`current block: ${now}`);
    log = await stakingDistributor.nextEpochBlock();
    console.log(`nextEpochBlock: ${log}`);

}

module.exports.tags = ["setEpoch"]
