import { ethers } from "ethers";

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

export const estimatedMintCost = (charCount, pricePerChar): string => {
  return ethers.utils.formatUnits(
    (BigInt(charCount) * BigInt(pricePerChar)).toString()
  );
};

export const toEther = amountInWei => {
  return ethers.utils.formatUnits(amountInWei);
};
