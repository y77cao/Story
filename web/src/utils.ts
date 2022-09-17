import { ethers } from "ethers";

export const toStories = tokens => {
  const stories = {};
  tokens.forEach(token => {
    const { amount, creator, text, title, withdrawn } = token;
    const titleStr = ethers.utils.toUtf8String(title);
    if (token.isBeginning) stories[titleStr] = [];

    stories[titleStr].push({
      amount: amount.toString(),
      creator,
      text: ethers.utils.toUtf8String(text),
      title: titleStr,
      withdrawn: withdrawn.toString()
    });
  });

  return stories;
};
