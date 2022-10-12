import { ethers, BigNumber } from "ethers";

export const toStories = tokens => {
  const stories = {};
  tokens.forEach((token, index) => {
    const { amount, creator, text, title, parentTokenId, withdrawn } = token;
    if (token.isBeginning) stories[parentTokenId] = [];

    stories[parentTokenId].push({
      amount: amount.toString(),
      creator,
      text: text,
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
