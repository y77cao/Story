import React from "react";
import { connect, useDispatch } from "react-redux";
import { MintPreview } from "./MintPreview";
import { mint, clearTransaction } from "../redux/blockchainSlice";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import { estimatedMintCost } from "../utils";
import { PopupModal, modalState } from "./PopupModal";

const MintConfirmation = ({
  text,
  parentId,
  creator,
  pricePerChar,
  loading,
  transaction,
  setMintConfirmationVisible,
  setSaved
}) => {
  const dispatch = useDispatch();

  return (
    <MintConfirmationWrapper>
      <HeaderWrapper>
        <div style={{ margin: "0 4px" }}>Confirm</div>
        <HeaderButton
          onClick={e => {
            e.preventDefault();
            setMintConfirmationVisible(false);
          }}
        >
          X
        </HeaderButton>
      </HeaderWrapper>
      <ContentWrapper>
        <MintPreview {...{ text, parentId, creator }} />
        <Text>
          Saving this snippet will mint an ERC721 token on Ethereum with all
          data on-chain. The mint cost will be $
          {estimatedMintCost(text.length, pricePerChar)} ether plus gas. Are you
          sure you want to proceed?
        </Text>
        <ContentButtonWrapper>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              setMintConfirmationVisible(false);
            }}
          >
            Cancel
          </ContentButton>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              dispatch(mint(text, parentId));
            }}
          >
            Confirm
          </ContentButton>
        </ContentButtonWrapper>
      </ContentWrapper>
      {transaction ? (
        <PopupModal
          state={modalState.SUCCESS}
          message={
            "Mint successful. Check your transaction on Etherscan and verify your token on Opensea."
          }
          onClose={() => {
            dispatch(clearTransaction());
            setMintConfirmationVisible(false);
            setSaved(true);
          }}
          onOk={() => {
            dispatch(clearTransaction());
            setMintConfirmationVisible(false);
            setSaved(true);
          }}
        />
      ) : null}
    </MintConfirmationWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  creator: state.blockchain.account,
  pricePerChar: state.blockchain.pricePerChar,
  loading: state.blockchain.loading,
  transaction: state.blockchain.transaction,
  ...ownProps
});

/** TODO: link on popup, refresh on re-open, tooltip, withdraw funds, tabs app, bottom icon */

export default connect(mapStateToProps)(MintConfirmation);

const MintConfirmationWrapper = styled(StyledContainer)`
  position: absolute;
  width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  align-items: center;
`;
const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: grey;
  color: white;
`;

const HeaderButton = styled(StyledButton)`
  margin: 2px;
  width: 35px;
  height: 25px;
`;
const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const ContentButtonWrapper = styled.div``;

const ContentButton = styled(StyledButton)`
  margin: 10px;
`;

const Text = styled.div`
  text-align: center;
  margin: 0 10px;
`;
