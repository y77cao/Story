import React, { useState } from "react";
import styled from "styled-components";
import { connect, useDispatch } from "react-redux";
import { WindowHeader } from "./WindowHeader";
import { PopupModal, modalState } from "./PopupModal";
import { StyledButton, StyledContainer } from "../styles/globalStyles";
import {
  checkBalance,
  withdrawFund,
  clearTransaction
} from "../redux/blockchainSlice";
import { BigNumber } from "ethers";
import { toEther } from "../utils";

const WithdrawFund = ({ onClose, balance, transaction }) => {
  const dispatch = useDispatch();
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  return (
    <WithdrawFundWrapper>
      <WindowHeader
        title={"Check Balance / Withdraw Fund"}
        onClickCloseButton={onClose}
      ></WindowHeader>
      <ContentWrapper>
        <Content>
          <div>Token Id:</div>
          <input
            type={"number"}
            onChange={e => setTokenId(e.target.value)}
          ></input>
          {balance && <div>Balance: {toEther(balance)} ether</div>}
        </Content>
        <ContentButtonWrapper>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              dispatch(checkBalance(tokenId));
            }}
          >
            Check Balance
          </ContentButton>
          <ContentButton
            onClick={e => {
              e.preventDefault();
              setConfirmationVisible(true);
            }}
          >
            Withdraw Fund
          </ContentButton>
        </ContentButtonWrapper>
      </ContentWrapper>
      {confirmationVisible ? (
        <PopupModal
          state={modalState.WARN}
          message={`The balance ${toEther(
            balance
          )} ether of token id ${tokenId} will be withdrawn.`}
          onClose={() => {
            setConfirmationVisible(false);
          }}
          onOk={() => {
            dispatch(withdrawFund(tokenId, balance));
          }}
        />
      ) : null}
      {transaction ? (
        <PopupModal
          state={modalState.SUCCESS}
          message={[
            "Success! Please check the transaction on ",
            <a href={`${process.env.NEXT_ETHERSCAN_URL}`}>Etherscan</a>,
            "."
          ]}
          onClose={() => {
            dispatch(clearTransaction());
            setConfirmationVisible(false);
          }}
          onOk={() => {
            dispatch(clearTransaction());
            setConfirmationVisible(false);
          }}
        />
      ) : null}
    </WithdrawFundWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  balance: state.blockchain.tokenIdWithBalance.balance,
  transaction: state.blockchain.transaction,
  ...ownProps
});

export default connect(mapStateToProps)(WithdrawFund);

const WithdrawFundWrapper = styled(StyledContainer)`
  position: absolute;
  width: 500px;
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

const Content = styled.div``;
