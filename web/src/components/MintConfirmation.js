import React from "react";
import { connect, useDispatch } from "react-redux";
import Canvas from "./Canvas";
import { upload, claimSuccess } from "../redux/appSlice";
import { mint } from "../redux/blockchainSlice";

const MintConfirmation = props => {
  const dispatch = useDispatch();
  return (
    <div>
      <Canvas />
      <div
        onClick={e => {
          e.preventDefault();
          dispatch(mintAndUpload(props.content.length));
        }}
      >
        Mint?
      </div>
      <div
        onClick={e => {
          e.preventDefault();
          props.toggleMintConfirmationVisible();
        }}
      >
        Bye
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return state.app;
};

const mintAndUpload = contentLength => async dispatch => {
  dispatch(mint(contentLength)).then(res => {
    console.log(res);
    return res;
  });
  dispatch(claimSuccess());
};

export default connect(mapStateToProps)(MintConfirmation);
