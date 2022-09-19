import React from "react";
import styled from "styled-components";
import Image from "next/image";
import error from "../../public/error.png";
import { StyledButton, StyledContainer } from "../styles/globalStyles";

export const ErrorModal = ({ title = "Error", message, setDisplayedError }) => {
  return (
    <ErrorModalWrapper>
      <HeaderWrapper>
        <div style={{ margin: "0 4px" }}>{title}</div>
        <CloseButton
          onClick={e => {
            e.preventDefault();
            setDisplayedError("");
          }}
        >
          x
        </CloseButton>
      </HeaderWrapper>
      <ContentWrapper>
        <Image src={error} width={38}></Image>
        <div style={{ textAlign: "left", width: "300px" }}>{message}</div>
      </ContentWrapper>
      <OkButton
        onClick={e => {
          e.preventDefault();
          setDisplayedError("");
        }}
      >
        OK
      </OkButton>
    </ErrorModalWrapper>
  );
};

const ErrorModalWrapper = styled(StyledContainer)`
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
  display: flex;
  justify-content: space-around;
`;
const OkButton = styled(StyledButton)`
  margin: 10px;
`;
