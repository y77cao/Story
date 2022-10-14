import React from "react";
import styled from "styled-components";
import Image from "next/image";
import error from "../../public/error.png";
import warning from "../../public/warning.png";
import success from "../../public/success.png";
import { StyledButton, StyledContainer } from "../styles/globalStyles";
import { WindowHeader } from "./WindowHeader";

export enum modalState {
  ERROR,
  WARN,
  SUCCESS
}
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
export const PopupModal = ({ state, message, onClose, onOk }) => {
  const { icon, title } = getIconAndTitle(state);
  return (
    <PopupModalWrapper>
      <WindowHeader title={title} onClickCloseButton={onClose}></WindowHeader>
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
      <OkButton
        onClick={e => {
          e.preventDefault();
          onOk();
        }}
      >
        OK
      </OkButton>
    </PopupModalWrapper>
  );
};

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
