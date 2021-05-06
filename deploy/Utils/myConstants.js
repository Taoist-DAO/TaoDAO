// const DAOProfitShare = "10" // 10 = 10% 1/10
// const LPProfitShare = "2" // 2 = 50% 1/2
// const blocksInEpoch = "7200" //9600 = 8 Hours 7200 = 6 Hours
// const dayInBlocks = "28800"
// const rewardRate = "30" // 40 = 0.4%
// const LPRewardRate = "20000000"// per block 10000000 = 0.01 Tao Per Block, 480 Per Epoch, 1440 Tao per day
// const trapAmount = "2000"
// const blocksToWait = "3600" //1200 hour, 600 30 min, 200 10 min

const DAOProfitShare = "10" // 10 = 10% 1/10
const LPProfitShare = "2" // 2 = 50% 1/2
const blocksInEpoch = "100" //9600 = 8 Hours 7200 = 6 Hours
const dayInBlocks = "28800"
const rewardRate = "30" // 40 = 0.4%
const LPRewardRate = "20000000"// per block 10000000 = 0.01 Tao Per Block, 480 Per Epoch, 1440 Tao per day
const trapAmount = "2000"
const blocksToWait = "0" //1200 hour, 600 30 min, 200 10 min

//Bonding
const BCV = "150"
const bondVestingPeriod = 5 * dayInBlocks
const minPremium = "600" //100 = 1

module.exports = {
    DAOProfitShare,
    LPProfitShare,
    blocksInEpoch,
    dayInBlocks,
    rewardRate,
    LPRewardRate,
    BCV,
    bondVestingPeriod,
    minPremium,
    trapAmount,
    blocksToWait
}
