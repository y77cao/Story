import React from "react";

export const ConfirmationModal = ({}) => {
  return (
    <div>
      <div>Estimated mint cost: {estimatedMintCost()} ether. </div>
      <StyledButton
        onClick={e => {
          e.preventDefault();
          toggleMintConfirmationVisible();
        }}
      >
        MINT
      </StyledButton>
      {mintConfirmationVisible ? (
        <MintConfirmation
          text={input}
          creator={blockchain.account}
          parentId={0}
          toggleMintConfirmationVisible={toggleMintConfirmationVisible}
        />
      ) : null}
    </div>
  );
};
