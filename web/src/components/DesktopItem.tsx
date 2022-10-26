import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Image from "next/image";

import notepad from "../../public/notepad.png";
import windowOpenAudio from "../../public/audio/window-open.wav";
import hoverAudio from "../../public/audio/hover.wav";

const playAudio = (audio, audioEnabled) => {
  if (audioEnabled) new Audio(audio).play();
};

const DesktopItem = ({ title, onClickItem, audioEnabled }) => {
  return (
    <DesktopItemWrapper
      onClick={() => {
        onClickItem();
        playAudio(windowOpenAudio, audioEnabled);
      }}
      onMouseEnter={() => playAudio(hoverAudio, audioEnabled)}
    >
      <Image src={notepad} width={38} height={38}></Image>
      <div>{title}</div>
    </DesktopItemWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  audioEnabled: state.app.audioEnabled,
  ...ownProps
});
export default connect(mapStateToProps)(DesktopItem);

const DesktopItemWrapper = styled.div`
  margin: 15px;
  text-align: center;
  cursor: pointer;
  width: 100px;
  :hover {
    color: pink;
  }
`;
