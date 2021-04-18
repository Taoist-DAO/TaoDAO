const { expect } = require("chai");

function toWei(n) {
    return ethers.utils.parseEther(n).toString();
}

function toTao(n) {
    return ethers.utils.parseUnits(n, 9).toString();
}

describe("TaoPresale", function() {
    let Presale, Busd, Tao, presale, busd, tao, owner, investor1, investor2, investor3, bank;

    beforeEach(async function () {
        Presale = await ethers.getContractFactory("TaoPresale");
        Busd = await ethers.getContractFactory("MockBUSD");
        Tao = await ethers.getContractFactory("MockTAO");
        [owner, investor1, investor2, investor3, bank, AbortController_] = await ethers.getSigners();

        busd = await Busd.deploy();
        tao = await Tao.deploy();
        presale = await Presale.deploy(busd.address, tao.address);

        // Transfer money to investors.
        await busd.transfer(investor1.address, toWei('10000'));
        await busd.transfer(investor2.address, toWei('10000'));
        await busd.transfer(investor3.address, toWei('10000'));
        await busd.transfer(bank.address, toWei('100000'));

        // Transfer Tao to Presale.
        await tao.transfer(presale.address, toTao('80000'));
    });

    describe("Deployment", function () {

        it("Should transfer 10000 to investors", async function () {
            const balance1 = await busd.balanceOf(investor1.address);
            const balance2 = await busd.balanceOf(investor2.address);
            const balance3 = await busd.balanceOf(investor3.address);
            expect(balance1).to.equal(toWei('10000'))
            expect(balance2).to.equal(toWei('10000'))
            expect(balance3).to.equal(toWei('10000'))
        });
        it("Should transfer 80000 to presale", async function () {
            const balance = await tao.balanceOf(presale.address);
            expect(balance).to.equal(toTao('80000'))
        });

    });

    describe("Whitelist Functions", function () {
        beforeEach( async function() {
            await presale.addMultipleWhitelistedAddresses([investor2.address,investor3.address])
        });

        it("Should add to whitelisted", async function () {
            await presale.addWhitelistedAddress(investor1.address);
            expect(await presale.whitelistedAddresses(investor1.address)).to.equal(true);
            expect(await presale.whitelistedAddresses(investor2.address)).to.equal(true);
            expect(await presale.whitelistedAddresses(investor3.address)).to.equal(true);
            expect(await presale.totalWhitelisted()).to.equal('3');
        });

        it("Should remove whitelisted", async function () {
            await presale.removeWhitelistedAddress(investor1.address)
            expect(await presale.whitelistedAddresses(investor1.address)).to.equal(false);


        });
    });

    describe("Owner", function () {

        it("Should be able to initialize", async function () {
            await presale.initialize(toTao('100000'),toWei('20'));
            let _target = await presale.taoTarget.call();
            let _price = await presale.price.call();
            expect(_target.toString()).to.equal('100000000000000');
            expect(_price.toString()).to.equal('20000000000000000000');
            expect(await presale.isInitialized.call()).to.equal(true);

        });

        it("Should be able to set Target, Price", async function () {
            await presale.setTaoTarget(toTao('80000'));
            await presale.setPrice(toWei('10'));
            let _target = await presale.taoTarget.call();
            let _price = await presale.price.call();
            expect(_target.toString()).to.equal('80000000000000');
            expect(_price.toString()).to.equal('10000000000000000000');
        });

        it("Should be able to withdraw", async function () {
            await presale.initialize(toTao('100000'),toWei('20'));
            await presale.unlockStart({ from: owner.address });
            await presale.unlockEnd({ from: owner.address });
            await busd.connect(bank).transfer(presale.address, toWei('100000'));
            await presale.withdrawRemainingBusd({ from: owner.address });
            let withdrawn = await busd.balanceOf(owner.address);
            let balance = await busd.balanceOf(presale.address);
            expect(withdrawn.toString()).to.equal('100000000000000000000000');
            expect(balance.toString()).to.equal('0');
        });
    });

    describe("Whitelisted Buyer", function () {
        beforeEach( async function() {
            await presale.initialize(toTao('3000'),toWei('10'));
            await presale.addMultipleWhitelistedAddresses([investor1.address,investor2.address,investor3.address]);
        });

        it("Should not be able to buy before Start()", async function () {
            await expect(presale.connect( investor1 ).buy(toWei('2000')))
            .to.be.revertedWith("presale has not yet started");
        });

        it("Should get correct allotment", async function () {
            expect( await presale.totalWhitelisted.call()).to.equal('3');
            expect( await presale.getAllotmentPerBuyer()).to.equal('10000000000000000000000');
        });

        it("Should be able to purchase the correct amount", async function () {
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
            await presale.connect( investor1 ).buy(toWei('5000'));
            let balance1 = await busd.balanceOf(investor1.address);
            let balance2 = await busd.balanceOf(presale.address);
            await expect(balance1.toString()).to.equal('5000000000000000000000');
            await expect(balance2.toString()).to.equal('5000000000000000000000');

            expect( await presale.getAllotmentPerBuyer()).to.equal('12500000000000000000000');
        });

        it("Should not be able to purchase after End()", async function () {
            await presale.unlockStart();
            await presale.unlockEnd();
            await busd.connect( investor1 ).approve(presale.address, toWei('2000'));
            await expect(presale.connect( investor1 ).buy(toWei('2000')))
            .to.be.revertedWith("presale already ended");
        });

        it("Should get correct claimable amount", async function () {
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
            await presale.connect( investor1 ).buy(toWei('5000'));
            expect( await presale.connect( investor1 ).claimableAmount(investor1.address)).to.equal('500000000000');

        });

        it("Should be unable to claim before unlockClaim", async function () {
            await expect(presale.connect( investor1 ).claim()).to.be.revertedWith("claiming not allowed yet");
        });

        it("Should have correct TotalOwed and BusdRaised", async function () {
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
            await presale.connect( investor1 ).buy(toWei('5000'));
            await busd.connect( investor2 ).approve(presale.address, toWei('7500'));
            await presale.connect( investor2 ).buy(toWei('7500'));
            await busd.connect( investor3 ).approve(presale.address, toWei('10000'));
            await presale.connect( investor3 ).buy(toWei('10000'));
            _totalOwed = await presale.totalOwed();
            _busdRaised = await presale.busdRaised();
            expect(_totalOwed.toString()).to.equal("2250000000000");
            expect(_busdRaised.toString()).to.equal("22500000000000000000000");
        });

        it("Should claim the right amount", async function () {
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
            await presale.connect( investor1 ).buy(toWei('5000'));
            await presale.unlockEnd();
            await presale.unlockClaim();
            await presale.connect( investor1 ).claim();
            let balance1 = await tao.balanceOf( investor1.address );
            expect(balance1.toString()).to.equal("500000000000")

        });

        it("Should have nothing to claim once claimed", async function () {
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
            await presale.connect( investor1 ).buy(toWei('5000'));
            await presale.unlockEnd();
            await presale.unlockClaim();
            await presale.connect( investor1 ).claim();
            await expect(presale.connect( investor1 ).claim()).to.be.revertedWith("nothing to claim")
        });
    });

    describe("Non-Whitelisted persons", function () {
        beforeEach(async function() {
            await presale.initialize(toTao('100000'),toWei('20'));
            await presale.unlockStart();
            await busd.connect( investor1 ).approve(presale.address, toWei('5000'));
        });

        it("Should not be able to purchase", async function () {
            await expect(presale.connect( investor1 ).buy(toWei('5000')))
            .to.be.revertedWith("you are not whitelisted");
        });

        it("Should not have any claimable", async function () {
            expect( await presale.connect( investor1 ).claimableAmount(investor1.address)).to.equal("0");

        });
    });
});
