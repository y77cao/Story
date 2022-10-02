import { ethers, BigNumber } from "ethers";

export const toStories = tokens => {
  const stories = {};
  tokens.forEach((token, index) => {
    const { amount, creator, text, title, parentTokenId, withdrawn } = token;
    if (token.isBeginning) stories[parentTokenId] = [];

    stories[parentTokenId].push({
      amount: amount.toString(),
      creator,
      text: ethers.utils.toUtf8String(text),
      title: ethers.utils.toUtf8String(title),
      withdrawn: withdrawn.toString()
    });
  });

  return stories;
};

export const estimatedMintCost = (
  charCount: number,
  pricePerChar: BigNumber
): string => {
  return ethers.utils.formatUnits(BigNumber.from(charCount).mul(pricePerChar));
};

export const toEther = amountInWei => {
  return ethers.utils.formatUnits(amountInWei);
};

export const parseOnChainError = error => {};

export const wordWrap = (str, charMax) => {
  let arr = [];
  let space = /\s+/;

  const words = str.trim().split(space);
  arr.push(words[0]);
  for (let i = 1; i < words.length; i++) {
    if (words[i].length + arr[arr.length - 1].length < charMax) {
      arr[arr.length - 1] = `${arr[arr.length - 1]} ${words[i]}`;
    } else {
      arr.push(words[i]);
    }
  }

  return arr;
};
