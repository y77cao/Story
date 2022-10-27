import React, { useEffect } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Image from "next/image";

import { StyledButton, StyledContainer } from "../styles/globalStyles";
import WindowHeader from "./WindowHeader";
import { device } from "../constants";

import error from "../../public/error.png";
import warning from "../../public/warning.png";
import success from "../../public/success.png";
import loadingGif from "../../public/loading.gif";

import errorAudio from "../../public/audio/error.wav";
import warningAudio from "../../public/audio/warning.wav";
import successAudio from "../../public/audio/success.wav";

export enum modalState {
  ERROR,
  WARN,
  SUCCESS
}

const playAudio = audio => {
  new Audio(audio).play();
};

const playAudioOnDisplay = state => {
  switch (state) {
    case modalState.ERROR:
      playAudio(errorAudio);
      break;
    case modalState.WARN:
      playAudio(warningAudio);
      break;
    case modalState.SUCCESS:
      playAudio(successAudio);
      break;
  }
};

const getIconAndTitle = state => {
  switch (state) {
    case modalState.ERROR:
      return {
        icon: <Image src={error} width={38} height={38}></Image>,
        title: "Error"
      };
    case modalState.WARN:
      return {
        icon: <Image src={warning} width={38} height={38}></Image>,
        title: "Warning"
      };
    case modalState.SUCCESS:
      return {
        icon: <Image src={success} width={38} height={38}></Image>,
        title: "Success"
      };
  }
};

const PopupModal = ({
  state,
  message,
  onClose,
  onOk,
  audioEnabled,
  loading = false
}) => {
  const { icon, title } = getIconAndTitle(state);

  useEffect(() => {
    if (audioEnabled) playAudioOnDisplay(state);
  }, []);

  return (
    <PopupModalWrapper>
      <WindowHeader title={title} onClickCloseButton={onClose}></WindowHeader>
      {loading ? (
        <Image src={loadingGif} width={50} height={50}></Image>
      ) : (
        <ContentWrapper>
          {icon}
          <div
            style={{
              textAlign: "left",
              marginLeft: "20px",
              maxWidth: "250px",
              overflow: "hidden"
            }}
          >
            {message}
          </div>
        </ContentWrapper>
      )}
      <OkButton onClick={onOk}>OK</OkButton>
    </PopupModalWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  audioEnabled: state.app.audioEnabled,
  ...ownProps
});
export default connect(mapStateToProps)(PopupModal);

const PopupModalWrapper = styled(StyledContainer)`
  position: absolute;
  width: 400px;
  height: 200px;
  display: flex;
  flex-direction: column;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  align-items: center;
  justify-content: space-between;
  z-index: 999;
  @media ${device.tablet} {
    width: 100%;
  }
`;

const ContentWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const OkButton = styled(StyledButton)`
  margin: 10px;
`;
