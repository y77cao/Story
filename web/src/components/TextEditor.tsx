import React, { useState } from "react";
import { connect, useDispatch } from "react-redux";
import styled from "styled-components";
import { StyledContainer, StyledButton } from "../styles/globalStyles";

const TextEditor = ({ textMetadata, title, parentId, setActiveStory }) => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  return (
    <TextEditorWrapper>
      <HeaderWrapper>
        <div style={{ margin: "0 4px" }}>{title}</div>
        <CloseButton
          onClick={e => {
            e.preventDefault();
            setActiveStory(null);
          }}
        >
          x
        </CloseButton>
      </HeaderWrapper>
      <ContentWrapper>
        {textMetadata.map(metadata => (
          <div>{metadata.text}</div>
        ))}
        <StyledInput
          role="textbox"
          contentEditable={true}
          autoFocus={true}
          onBlur={({ target }) => target.focus()}
          onChange={e => setInput(e.target.value)}
        >
          {""}
        </StyledInput>
      </ContentWrapper>
    </TextEditorWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  textMetadata: state.blockchain.stories[ownProps.parentId],
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
const CloseButton = styled(StyledButton)`
  margin: 2px;
`;
const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: inline-flex;
  background-color: white;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const StyledInput = styled.span`
  border: none;
  &:focus {
    outline: none;
  }
  &:empty:focus::before,
  &:empty::before {
    content: " ...and?";
    color: lightgrey;
  }

  color: black;
`;
