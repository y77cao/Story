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
      title: ethers.utils.parseBytes32String(title),
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

export const parseError = errorMsg => {
  // deal with on chain errors
  if (errorMsg.includes("NonEOASender")) {
    return "Cannot send transaction from non EOA account";
  }
  if (errorMsg.includes("InvalidText")) {
    return "Input text is invalid";
  }
  if (errorMsg.includes("TextWithoutParent")) {
    return "Cannot mint snippet without a story";
  }
  if (errorMsg.includes("IncorrectEthValue")) {
    return "Incorrect amount of ether sent";
  }
  if (errorMsg.includes("MoreTextMintRequired")) {
    return "You need to write more snippets before starting your own story";
  }
  if (errorMsg.includes("InsufficientBalance")) {
    return "Insufficient balance";
  }
  if (errorMsg.includes("UnauthorizedWithdraw")) {
    return "You do not have permission to withdraw";
  }
  if (errorMsg.includes("WithdrawFailed")) {
    return "Withdraw failed";
  }
  if (errorMsg.includes("NonExistentToken")) {
    return "Token does not exist";
  }

  return errorMsg;
};

export const validateText = text => {
  return /^[A-Za-z0-9 .?!,-:;()]*$/.test(text);
};
