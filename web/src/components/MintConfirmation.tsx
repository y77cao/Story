import React from "react";
import { useDispatch } from "react-redux";
import { MintPreview } from "./MintPreview";
import { mint } from "../redux/blockchainSlice";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";

export const MintConfirmation = ({
  text,
  parentId,
  creator,
  setMintConfirmationVisible
}) => {
  const dispatch = useDispatch();
  const estimatedMintCost = (): string => {
    return ethers.utils.formatUnits(
      (BigInt(input.length) * BigInt(blockchain.pricePerChar)).toString()
    );
  };
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
    </MintConfirmationWrapper>
  );
};

const MintConfirmationWrapper = styled(StyledContainer)`
  position: absolute;
  width: 400px;
  height: 400px;
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
