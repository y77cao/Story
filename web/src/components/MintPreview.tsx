import React, { useRef, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { updateImageUrl } from "../redux/appSlice";

export const MintPreview = ({ text, parentId, creator }) => {
  const svgString =
    `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">` +
    `<style>.base { fill: white; font-family: serif; font-size: 14px; }</style>` +
    `<rect width="100%" height="100%" fill="black" /><text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">${text}</text>` +
    `<text x="50%" y="50%" class="base" dominant-baseline="middle" text-anchor="middle">-- ${creator}</text></svg>`;

  return (
    <div
      className="someClassName"
      style={{ backgroundImage: `url(${svgString})` }}
    />
  );
};
