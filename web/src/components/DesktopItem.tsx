import React from "react";
import styled from "styled-components";
import Image from "next/image";
import notepad from "../../public/notepad.png";

export const DesktopItem = ({ title, onClick }) => {
  return (
    <DesktopItemWrapper>
      <Image src={notepad}></Image>
      <div onClick={onClick}>{title}</div>
    </DesktopItemWrapper>
  );
};

const DesktopItemWrapper = styled.div`
  margin: 15px;
  text-align: center;
  cursor: pointer;
`;

// const mapStateToProps = state => {
//   return state.app;
// };

// const mintAndUpload = contentLength => async dispatch => {
//   dispatch(mint(contentLength)).then(res => {
//     console.log(res);
//     return res;
//   });
//   dispatch(claimSuccess());
// };

// export default connect(mapStateToProps)(MintConfirmation);
