import React from "react";
import { useDispatch } from "react-redux";
import { connect } from "../redux/blockchainSlice";
import styled from "styled-components";
import Image from "next/image";
import computer from "../../public/computer.png";

export const Menu = ({}) => {
  const dispatch = useDispatch();
  return (
    <MenuWrapper>
      <MenuItem
        onClick={e => {
          e.preventDefault();
          dispatch(connect());
        }}
      >
        <ImageWrapper>
          <Image src={computer}></Image>
        </ImageWrapper>
        <div>Connect Wallet</div>
      </MenuItem>
      <MenuItem
        onClick={e => {
          e.preventDefault();
          // TODO
          // dispatch(connect());
        }}
      >
        <ImageWrapper>
          <Image src={computer}></Image>
        </ImageWrapper>
        <div>Withdraw Fund</div>
      </MenuItem>
    </MenuWrapper>
  );
};

const MenuWrapper = styled.div`
  width: 300px;
  background-color: lightgrey;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #fff;
  border-left: 1px solid #fff;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
  box-shadow: inset 1px 1px #dfdfdf, 1px 0 #000, 0 1px #000, 1px 1px #000;
`;

const MenuItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  &:hover {
    background-color: darkgrey;
  }
`;

const ImageWrapper = styled.div`
  margin: 10px;
`;
