import React, { useState } from "react";
import styled from "styled-components";
import { connect, useDispatch } from "react-redux";
import WindowHeader from "./WindowHeader";
import PopupModal, { modalState } from "./PopupModal";
import { StyledButton, StyledContainer } from "../styles/globalStyles";
import {
  checkBalance,
  withdrawFund,
  clearTransaction,
} from "../redux/blockchainSlice";
import { toEther } from "../utils";
import { device } from "../constants";
import { appError } from "../redux/appSlice";

const WithdrawFund = ({ onClose, balance, account, transaction, loading }) => {
  const dispatch = useDispatch();
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  const onClickWithdraw = () => {
    if (!account)
      return dispatch(
        appError("Please connect your wallet in Start > Login to withdraw")
      );
    if (tokenId) setConfirmationVisible(true);
  };

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
            onChange={(e) => setTokenId(e.target.value)}
          ></input>
          {balance && <div>Balance: {toEther(balance)} ether</div>}
        </Content>
        <ContentButtonWrapper>
          <ContentButton
            onClick={() => {
              dispatch(checkBalance(tokenId));
            }}
          >
            Check Balance
          </ContentButton>
          <ContentButton onClick={onClickWithdraw}>Withdraw Fund</ContentButton>
        </ContentButtonWrapper>
      </ContentWrapper>
      {confirmationVisible ? (
        <PopupModal
          state={modalState.WARN}
          loading={loading}
          message={`The balance of ${toEther(
            balance
          )} ether on token id ${tokenId} will be withdrawn.`}
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
            <a
              href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}tx/${transaction.hash}`}
              target="_blank"
            >
              Transaction Explorer
            </a>,
            ".",
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
  transaction: state.blockchain.withdrawTransaction,
  loading: state.blockchain.loading,
  account: state.blockchain.account,
  ...ownProps,
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
  @media ${device.tablet} {
    width: 100%;
    height: 80%;
  }
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

const Content = styled.div`
  > * {
    margin: 5px 0;
  }
`;
