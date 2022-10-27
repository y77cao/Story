import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Image from "next/image";

import arrow from "../../public/arrow.png";
import buttonClickAudio from "../../public/audio/button-click.wav";
import hoverAudio from "../../public/audio/hover.wav";

const playAudio = (audio, audioEnabled) => {
  if (audioEnabled) new Audio(audio).play();
};

const MenuItem = ({ text, onClickItem, audioEnabled }) => {
  return (
    <MenuItemWrapper
      onClick={() => {
        onClickItem();
        playAudio(buttonClickAudio, audioEnabled);
      }}
      onMouseEnter={() => playAudio(hoverAudio, audioEnabled)}
    >
      <ImageWrapper>
        <Image src={arrow} width={20} height={20}></Image>
      </ImageWrapper>
      <MenuInnerText>{text}</MenuInnerText>
    </MenuItemWrapper>
  );
};

const mapStateToProps = (state, ownProps) => ({
  audioEnabled: state.app.audioEnabled,
  ...ownProps
});
export default connect(mapStateToProps)(MenuItem);

const MenuItemWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  &:hover {
    background-color: darkgrey;
  }
  cursor: pointer;
`;

const MenuInnerText = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 70%;
`;

const ImageWrapper = styled.div`
  margin: 10px;
`;
