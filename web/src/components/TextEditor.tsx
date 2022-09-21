import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import { MintConfirmation } from "./MintConfirmation";
import { appError } from "../redux/appSlice";
import { PopupModal, modalState } from "./PopupModal";

const TextEditor = ({
  textMetadata,
  title,
  parentId,
  creator,
  setActiveStory
}) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [mintConfirmationVisible, setMintConfirmationVisible] = useState(false);
  const [closeConfirmationVisible, setCloseConfirmationVisible] =
    useState(false);

  const validateMint = () => {
    if (input.length > 280)
      return dispatch(
        appError("Your snippet exceeds the maximum length of 280 charaters")
      );

    if (!creator)
      return dispatch(
        appError(
          "Please connect your wallet in Start > Connect Wallet to save your snippet"
        )
      );

    setMintConfirmationVisible(true);
  };

  return (
    <TextEditorWrapper>
      <HeaderWrapper>
        <div style={{ margin: "0 4px" }}>{title}</div>
        <ButtonsWrapper>
          <HeaderButton
            onClick={e => {
              e.preventDefault();
              if (!input) return;
              validateMint();
            }}
          >
            💾
          </HeaderButton>
          <HeaderButton
            onClick={e => {
              e.preventDefault();
              setCloseConfirmationVisible(true);
            }}
          >
            X
          </HeaderButton>
        </ButtonsWrapper>
      </HeaderWrapper>
      <ContentWrapper>
        {textMetadata.map(metadata => (
          <span>{metadata.text}</span>
        ))}
        <StyledInput
          role="textbox"
          contentEditable={true}
          autoFocus={true}
          onBlur={({ target }) => target.focus()}
          onInput={e => setInput(e.currentTarget.innerText)}
        >
          {""}
        </StyledInput>
      </ContentWrapper>
      {mintConfirmationVisible && (
        <MintConfirmation
          text={input}
          parentId={parentId}
          creator={creator}
          setMintConfirmationVisible={setMintConfirmationVisible}
        />
      )}
      {closeConfirmationVisible && (
        <PopupModal
          state={modalState.WARN}
          message={
            "Are you sure you want to exit? Your snippet will not be saved."
          }
          onClose={() => setCloseConfirmationVisible(false)}
          onOk={() => {
            setCloseConfirmationVisible(false);
            setActiveStory(null);
          }}
        />
      )}
    </TextEditorWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  textMetadata: state.blockchain.stories[ownProps.parentId],
  creator: state.blockchain.account,
  ...ownProps
});

export default connect(mapStateToProps)(TextEditor);

const TextEditorWrapper = styled(StyledContainer)`
  position: absolute;
  width: 800px;
  height: 600px;
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
  display: inline;
  float: left;
  background-color: white;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledInput = styled.span`
  border: none;
  &:focus {
    outline: none;
  }
  &:empty:focus::before,
  &:empty::before {
    content: "...start typing...";
    color: lightgrey;
  }

  color: black;
`;
