const { expect } = require("chai");

function toWei(n) {
    return ethers.utils.parseEther(n).toString();
}

function toTao(n) {
    return ethers.utils.parseUnits(n, 9).toString();
}

describe("TaoStaking", function() {
    let owner, addr1, addr2, Tao, tao, sTAO, sTao, Staking, staking

    beforeEach(async function () {
        [owner, addr1, addr2, AbortController_] = await ethers.getSigners();

        Tao = await ethers.getContractFactory("MockTAO")
        tao = await Tao.deploy()
        console.log(`Deploying Tao to: ${tao.address}`)
        console.log(`Tao Balance: ${await tao.balanceOf(owner.address)}`)

        sTAO = await ethers.getContractFactory("sTaoToken")
        sTao = await sTAO.deploy()
        console.log(`Deploying sTao to: ${sTao.address}`)

        Staking = await ethers.getContractFactory("TaoStaking")
        staking = await Staking.deploy()
        console.log(`Deploying Staking to: ${staking.address}`)

        await staking.initialize(
            tao.address,
            sTao.address,
            "2200"
            )
        const nextEpochBlock = await staking.nextEpochBlock()
        console.log(`Next Epoch Block: ${nextEpochBlock}`)


    });

    describe("Tao Holders", function () {

        it("Should be able to stake", async function () {
            await staking.stakeTAO(toTao("1000"))
            const balance = tao.balanceOf(staking.address)
            expect(balance.toString()).to.equal("1000000000000")


        });
        xit("Should be able to unstake", async function () {

        });

    });
});

