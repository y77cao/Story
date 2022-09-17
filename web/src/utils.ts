import { ethers } from "ethers";

export const toStories = tokens => {
  const stories = {};
  tokens.forEach(token => {
    if (token.isBeginning) stories[token.parentTokenId] = [];

    const { amount, creator, text, title, withdrawn } = token;
    stories[token.parentTokenId].push({
      amount: amount.toString(),
      creator,
      text: ethers.utils.toUtf8String(text),
      title: ethers.utils.toUtf8String(title),
      withdrawn: withdrawn.toString()
    });
  });

  return stories;
};
