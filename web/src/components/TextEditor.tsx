import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import MintConfirmation from "./MintConfirmation";
import { appError } from "../redux/appSlice";
import { previewMint } from "../redux/blockchainSlice";
import { PopupModal, modalState } from "./PopupModal";
import { TextWithTooltip } from "./TextWithTooltip";
import { WindowHeader } from "./WindowHeader";

const TextEditor = ({ textMetadata, title, parentId, creator, onClose }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const inputSpan = useRef();
  const [mintConfirmationVisible, setMintConfirmationVisible] = useState(false);
  const [closeConfirmationVisible, setCloseConfirmationVisible] =
    useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    // @ts-ignore
    inputSpan.current.focus();
  }, []);

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
    return dispatch(previewMint(input, creator, title));
  };

  return (
    <TextEditorWrapper>
      <WindowHeader
        title={title}
        onClickCloseButton={() => {
          if (saved || !input.length) onClose();
          else setCloseConfirmationVisible(true);
        }}
      >
        <HeaderButton
          disabled={saved}
          onClick={e => {
            e.preventDefault();
            // @ts-ignore
            inputSpan.current.blur();
            if (!input) return;
            validateMint();
          }}
        >
          💾
        </HeaderButton>
      </WindowHeader>
      <ContentWrapper>
        {textMetadata.map(metadata => (
          <TextWithTooltip textMetadata={metadata} />
        ))}
        <StyledInput
          role="textbox"
          contentEditable={true}
          autoFocus={true}
          onInput={e => {
            setInput(e.currentTarget.innerText);
            setSaved(false);
          }}
          ref={inputSpan}
        >
          {""}
        </StyledInput>
      </ContentWrapper>
      {mintConfirmationVisible && (
        <MintConfirmation
          text={input}
          parentId={parentId}
          setMintConfirmationVisible={setMintConfirmationVisible}
          setSaved={setSaved}
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
            onClose();
          }}
        />
      )}
    </TextEditorWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  textMetadata: state.blockchain.stories[ownProps.parentId] || [],
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
