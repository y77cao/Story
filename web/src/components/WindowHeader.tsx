import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { StyledButton } from "../styles/globalStyles";

import windowCloseAudio from "../../public/audio/window-close.wav";

const playAudio = () => {
  new Audio(windowCloseAudio).play();
};

const WindowHeader = ({
  title,
  onClickCloseButton,
  audioEnabled,
  children = null
}) => {
  return (
    <HeaderWrapper>
      <div style={{ margin: "0 4px" }}>{title}</div>
      <ButtonsWrapper>
        {children}
        <HeaderButton
          onClick={() => {
            if (audioEnabled) playAudio();
            onClickCloseButton();
          }}
        >
          X
        </HeaderButton>
      </ButtonsWrapper>
    </HeaderWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  audioEnabled: state.app.audioEnabled,
  ...ownProps
});
export default connect(mapStateToProps)(WindowHeader);

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

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
