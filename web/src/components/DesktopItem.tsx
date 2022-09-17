import React from "react";
export const DesktopItem = ({ title, onClick }) => {
  return (
    <div>
      <div onClick={onClick}>{title}</div>
    </div>
  );
};

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
