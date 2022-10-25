import React, { useState, useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";
import MintConfirmation from "./MintConfirmation";
import { appError } from "../redux/appSlice";
import { fetchData, previewMint } from "../redux/blockchainSlice";
import { PopupModal, modalState } from "./PopupModal";
import { TextWithTooltip } from "./TextWithTooltip";
import { WindowHeader } from "./WindowHeader";
import { estimatedMintCost, validateText } from "../utils";

const TextEditor = ({
  editable = true,
  textMetadata,
  title,
  pricePerChar,
  parentId,
  creator,
  onClose,
  children
}) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const inputSpan = useRef();
  const [mintConfirmationVisible, setMintConfirmationVisible] = useState(false);
  const [closeConfirmationVisible, setCloseConfirmationVisible] =
    useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    // @ts-ignore
    inputSpan?.current?.focus();
  }, []);

  const validateMint = () => {
    if (input.length > 280)
      return dispatch(
        appError("Your snippet exceeds the maximum length of 280 charaters")
      );

    if (!validateText(input))
      return dispatch(
        appError(
          "Snippet contains invalid character(s). Only letters, numbers, single space, and punctuation marks: [.?!,-:;()] are allowed"
        )
      );

    if (!creator)
      return dispatch(
        appError(
          "Please connect your wallet in Start > Login to save your snippet"
        )
      );

    setMintConfirmationVisible(true);
    return dispatch(previewMint(input, creator, title));
  };

  const renderEditableModeButtons = () => {
    return [
      <HeaderButton
        onClick={() => {
          dispatch(fetchData());
        }}
        style={{ padding: "0", lineHeight: "10px" }}
      >
        ⟳
      </HeaderButton>,
      <HeaderButton
        disabled={saved || !input.length}
        onClick={() => {
          // @ts-ignore
          inputSpan.current.blur();
          if (!input) return;
          validateMint();
        }}
        style={{ fontSize: "medium" }}
      >
        💾
      </HeaderButton>
    ];
  };

  const renderEditableModeContent = () => {
    return [
      <InnerContentWrapper>
        {textMetadata.map(metadata => (
          <TextWithTooltip textMetadata={metadata} />
        ))}
        <StyledInput
          role="textbox"
          contentEditable={true}
          autoFocus={true}
          onInput={e => {
            setInput(e.currentTarget.innerText.replace(/\u200B/, "").trim());
            setSaved(false);
          }}
          ref={inputSpan}
        >
          {
            // https://stackoverflow.com/a/25898429
            // hack to show cursor in contentEdible span
            // u200B is &#8203; zero width space
          }
          {"\u200B"}
        </StyledInput>
      </InnerContentWrapper>,
      <EstimatedCostContainer inputLength={input.length}>
        Estimated mint price: {estimatedMintCost(input.length, pricePerChar)}{" "}
        ether + gas{" "}
      </EstimatedCostContainer>
    ];
  };

  const renderReadOnlyModeContent = () => {
    return <InnerContentWrapper>{children}</InnerContentWrapper>;
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
        {editable && renderEditableModeButtons()}
      </WindowHeader>
      <ContentWrapper>
        {editable ? renderEditableModeContent() : renderReadOnlyModeContent()}
      </ContentWrapper>
      {mintConfirmationVisible && (
        <MintConfirmation
          text={input}
          parentId={parentId}
          onCloseMintConfirmation={clearInput => {
            setMintConfirmationVisible(false);
            if (clearInput) {
              setInput("");
              // @ts-ignore
              inputSpan.current.innerText = "\u200B";
            }
            // if new story, close the new story window
            if (parentId == -1) onClose();
          }}
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
  pricePerChar: state.blockchain.pricePerChar,
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
  height: 100%;
  width: 100%;
  background-color: white;
  position: relative;
`;

const InnerContentWrapper = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  bottom: 0;
  left: 10px;
  display: inline;
  float: left;
  background-color: white;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const StyledInput = styled.span`
  border: none;
  min-width: 10px;
  padding-left: 1px;
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

const EstimatedCostContainer = styled.div`
  display: ${props => (props.inputLength === 0 ? "none" : "block")};
  position: absolute;
  bottom: 0;
  left: 0;
  font-family: "W95FARegular";
  background: pink;
`;
