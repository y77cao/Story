import React from "react";
import { connect, useDispatch } from "react-redux";
import { MintPreview } from "./MintPreview";
import { mint } from "../redux/blockchainSlice";

export const MintConfirmation = ({
  text,
  parentId,
  creator,
  toggleMintConfirmationVisible
}) => {
  const dispatch = useDispatch();
  return (
    <div>
      <MintPreview {...{ text, parentId, creator }} />
      <div
        onClick={e => {
          e.preventDefault();
          dispatch(mint(text, parentId));
        }}
      >
        Mint?
      </div>
      <div
        onClick={e => {
          e.preventDefault();
          toggleMintConfirmationVisible();
        }}
      >
        Bye
      </div>
    </div>
  );
};
