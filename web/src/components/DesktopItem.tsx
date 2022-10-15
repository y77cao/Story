import React from "react";
import styled from "styled-components";
import Image from "next/image";
import notepad from "../../public/notepad.png";

export const DesktopItem = ({ title, parentId, onClick }) => {
  return (
    <DesktopItemWrapper onClick={onClick}>
      <AnimatedImage src={notepad} width={38} height={38}></AnimatedImage>
      <div>{title}</div>
    </DesktopItemWrapper>
  );
};

const DesktopItemWrapper = styled.div`
  margin: 15px;
  text-align: center;
  cursor: pointer;
  width: 100px;
`;

const AnimatedImage = styled(Image)`
&:hover {
  animation:animate .2s linear;
}
@keyframes animate {
  0% {
    margin: 0 0;
  filter: hue-rotate(0deg);
  }
  10% {
    margin: 1px 0;
  }
  20% {
    margin: -1px 0;
  }
  30% {
    margin: 2px 0;
  }
  40% {
    margin: 1px 0;
  }
  50% {
    margin: -2px 0;
  }
  60% {
    margin: -3px 0;
  }
  70% {
    margin: 0 -2px;
  }
  80% {
    margin: -2px -3px;
  }
  81% {
    margin: 0 0;
  }
  100% {
    margin: 0 0;
  filter: hue-rotate(360deg);
  }
`;
