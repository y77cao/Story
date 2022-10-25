import React from "react";
import styled from "styled-components";
import Image from "next/image";

import notepad from "../../public/notepad.png";
import windowOpenAudio from "../../public/audio/window-open.wav";
import hoverAudio from "../../public/audio/hover.wav";

const playAudio = audio => {
  new Audio(audio).play();
};

export const DesktopItem = ({ title, parentId, onClickItem }) => {
  return (
    <DesktopItemWrapper
      onClick={() => {
        onClickItem();
        playAudio(windowOpenAudio);
      }}
      onMouseEnter={() => playAudio(hoverAudio)}
    >
      <Image src={notepad} width={38} height={38}></Image>
      <div>{title}</div>
    </DesktopItemWrapper>
  );
};

const DesktopItemWrapper = styled.div`
  margin: 15px;
  text-align: center;
  cursor: pointer;
  width: 100px;
  :hover {
    color: pink;
  }
`;
