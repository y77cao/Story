import React, { useState } from "react";
import styled from "styled-components";

export const TextWithTooltip = ({ textMetadata }) => {
  const [hover, setHover] = useState(false);
  return (
    <StyledSpan
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      {textMetadata.text}{" "}
      <Tooltip hover={hover}>
        <div>ID: {textMetadata.id}</div>
        <div>Creator: {textMetadata.creator}</div>
      </Tooltip>
    </StyledSpan>
  );
};

const StyledSpan = styled.span`
  &:hover {
    background-color: yellow;
  }
`;

const Tooltip = styled.span`
  display: ${props => (props.hover ? "block" : "none")};
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  background-color: pink;
  font-family: "W95FARegular";
  padding: 5px;
  box-shadow: inset 1px 1px #dfdfdf, 1px 0 #000, 0 1px #000, 1px 1px #000;
`;
