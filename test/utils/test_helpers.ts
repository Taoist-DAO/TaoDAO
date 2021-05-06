import { ethers } from "hardhat";

export async function mineBlocks(amount: number) {
  for (let i = 0; i < amount; i++) {
    await ethers.provider.send('evm_mine', []);
  }
}

export async function increaseTime(amount: number) {
  await ethers.provider.send('evm_increaseTime', [amount]);
}

export async function hardhatSnapshot() {
  return await ethers.provider.send('evm_snapshot', []);
}

export async function hardhatRevert(snapshotId: string) {
  return await ethers.provider.send('evm_revert', [snapshotId]);
}

export function fromWei(n) {
    return ethers.utils.formatEther( n ).toString();
}

export function toWei(n) {
    return ethers.utils.parseEther(n).toString();
}

export function toTao(n) {

    return ethers.utils.parseUnits(n, 9).toString();
}

export function fromTao(n) {

    return ethers.utils.formatUnits (n, 9).toString();
}

export async function printTaoBalance(adr,coin) {
    let b = await coin.balanceOf(adr);
    // b = b/ (10 ** 18);
    console.log("balance of " ,fromTao(b.toString()));
}

export async function printBalanceToWei(adr,coin) {
    let b = await coin.balanceOf(adr);
    // b = b/ (10 ** 26);
    console.log("balance of " ,fromWei(b.toString()));
}

