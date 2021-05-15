module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
    const { deploy } = deployments;
    const { deployer, dev } = await getNamedAccounts();
    const c = require('./myConstants');

    // Settings
    target = "75000000000000" // 75000 TAO
    price = "8000000000000000000" // 8 BUSD

    //Import Contracts
    vault = await deployments.get("Vault")
    presale = await deployments.get("TaoPresale")

    await presale.initialize( target , price , vault.address)

}
module.exports.tags = ["initPresale"]
module.exports.dependencies = ["Vault", "TaoPresale"]
