import React from "react";
import styled from "styled-components";
import Image from "next/image";
import notepad from "../../public/notepad.png";

export const DesktopItem = ({ title, parentId, onClick }) => {
  return (
    <DesktopItemWrapper onClick={onClick}>
      <Image src={notepad} width={38} height={38}></Image>
      <div>{title}</div>
    </DesktopItemWrapper>
  );
};

const DesktopItemWrapper = styled.div`
  margin: 15px;
  text-align: center;
  cursor: pointer;
`;
